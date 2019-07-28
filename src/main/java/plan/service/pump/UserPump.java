package plan.service.pump;

import java.net.InetSocketAddress;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.crap.jrain.core.ErrcodeException;
import org.crap.jrain.core.asm.annotation.Pipe;
import org.crap.jrain.core.asm.annotation.Pump;
import org.crap.jrain.core.asm.handler.DataPump;
import org.crap.jrain.core.bean.result.Errcode;
import org.crap.jrain.core.bean.result.Result;
import org.crap.jrain.core.bean.result.criteria.Data;
import org.crap.jrain.core.bean.result.criteria.DataResult;
import org.crap.jrain.core.error.support.Errors;
import org.crap.jrain.core.util.StringUtil;
import org.crap.jrain.core.validate.annotation.BarScreen;
import org.crap.jrain.core.validate.annotation.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;
import net.sf.json.JSONObject;
import plan.data.entity.User;
import plan.server.UserServer;
import plan.service.CustomErrors;
import plan.service.param.TokenParam;
import plan.service.utils.Coder;
import plan.service.utils.Tools;

@Pump("user")
@Component
public class UserPump extends DataPump<FullHttpRequest, Channel> {
	
	public static final Logger log = LogManager.getLogger(UserPump.class);
	
	@Autowired
	private UserServer userServer;
	@Autowired
	private StringRedisTemplate redisTemplate;
	
	@Pipe("addUser")
	@BarScreen(
		desc="新增用户",
		params= {
			@Parameter(value="userName",  desc="登录名"),
			@Parameter(value="userPwd",  desc="密码"),
			@Parameter(value="endTime",  desc="服务时间")
		}
	)
	public Errcode addUser (JSONObject params) throws ErrcodeException {
		User user = new User();
		user.setUserName(params.getString("userName"));
		user.setUserPwd(Coder.encryptMD5(params.getString("userPwd")));
		user.setCreateTime(Tools.getTimestamp());
		user.setEndTime(Tools.dateToStamp(params.getString("endTime") + " 00:00:00"));
		user.setState(true);
		userServer.insert(user);
		return new DataResult(Errors.OK);
	}
	
	@Pipe("login")
	@BarScreen(
		desc="用户登录",
		params= {
			@Parameter(value="userName",  desc="登录名"),
			@Parameter(value="userPwd",  desc="密码"),
		}
	)
	public Errcode login (JSONObject params) {
		String userName = params.getString("userName");
		String userPwd = params.getString("userPwd");
		User user = userServer.getUser(userName, userPwd);
		// 判断用户是否存在
		if (user == null) 
			return new Result(CustomErrors.USER_ACC_ERR);
		// 已登录 则删除当前登录状态，和所有队列的通知消息
		if (!Tools.isStrEmpty(user.getToken())) {
			redisTemplate.delete("user_" + user.getToken()); 
			redisTemplate.delete("queue_" + user.getToken()); 
			redisTemplate.delete("queue_" + user.getToken() + "_m"); 
		}
		
		if (!user.getState())
			return new Result(CustomErrors.USER_LOCKED);
		
		// 用户服务状态已过期
		if (Tools.isOverTime(Long.valueOf(user.getEndTime()), 1))
			return new Result(CustomErrors.USER_SERVER_END);
			
		// 生成新的用户token 并持久化
		String new_token = StringUtil.uuid(); 	
		user.setToken(new_token);
		if(userServer.updateToken(user) != 1)
			return new Result(CustomErrors.USER_LOGIN_UPDATE_TOKEN_EX);
		
		// 插入登录日志 
		InetSocketAddress insocket = (InetSocketAddress) getResponse().remoteAddress();
		System.out.println("IP:"+insocket.getAddress().getHostAddress());
		String ip = insocket.getAddress().getHostAddress();
		
		Map<Object, Object> userMap = new HashMap<Object, Object>();
		userMap.put("uid", user.getId());
		userMap.put("userName", user.getUserName());
		userMap.put("token", new_token);
		userMap.put("loginTime", String.valueOf(new Date().getTime()));
		userMap.put("loginIP", ip);
		redisTemplate.opsForHash().putAll("user_" + new_token, userMap);
		
		return new DataResult(Errors.OK, new Data(user));
	}
	
	@Pipe("userList")
	@BarScreen(
		desc="获取用户列表",
		params = {}
	)
	public Errcode userList (JSONObject params) throws ErrcodeException {
		
		return new DataResult(Errors.OK, new Data(userServer.getUsers()));
	}
	
	@Pipe("logout")
	@BarScreen(
		desc="用户退出",
		params = {
			@Parameter(type=TokenParam.class)
		}
	)
	public Errcode logout (JSONObject params) {
		String key = "user_" + params.getString("token").split("_")[0];
		redisTemplate.delete(key); // 删除缓存
		return new DataResult(Errors.OK);
	}
	
	
	@Pipe("bet")
	@BarScreen(
		desc="确定投注",
		params = {
		}
	)
	public Errcode bet(JSONObject params) {
		String key = "user_" + params.getString("token").split("_")[0];
		redisTemplate.delete(key); // 删除缓存
		return new DataResult(Errors.OK);
	}
}