package plan.service.pump;

import java.net.InetSocketAddress;
import java.util.Collections;
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
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;
import net.sf.json.JSONObject;
import plan.data.mongo.entity.User;
import plan.data.mongo.entity.field.UserInfo;
import plan.data.redis.RedisUtil;
import plan.server.BaseServer;
import plan.server.UserServer;
import plan.service.CustomErrors;
import plan.service.param.TokenParam;

@Pump("user")
@Component
public class UserPump extends DataPump<FullHttpRequest, Channel> {
	
	public static final Logger log = LogManager.getLogger(UserPump.class);
	
	@Autowired
	private UserServer userServer;
	
	@Pipe("changePwd")
	@BarScreen(
		desc="修改密码",
		security=true,
		params= {
			@Parameter(type=TokenParam.class),
			@Parameter(value="old_pwd",  desc="旧密码"),
			@Parameter(value="new_pwd",  desc="新密码")
		}
	)
	public Errcode changePwd(JSONObject params) throws ErrcodeException {
		UserInfo userInfo = userServer.getUserInfo(params);
		
		String oldPwd = params.getString("old_pwd");
		String newPwd = params.getString("new_pwd");
		
		User user = userServer.getUser(userInfo.getUserName(), oldPwd);
		if (user == null)
			throw new ErrcodeException(CustomErrors.USER_PWD_ERR);
		
		if(userServer.changePwd(userInfo.getUserName(), newPwd) > 0)
			return new Result(Errors.OK);
		return new Result(CustomErrors.USER_OPR_ERR);
	}
	
	
	@Pipe("login")
	@BarScreen(
		desc="用户登录",
		security=true,
		params= {
			@Parameter(value="login_name",  desc="登录名"),
			@Parameter(value="login_pwd",  desc="密码"),
		}
	)
	public Errcode login (JSONObject params) {
		String userName = params.getString("login_name");
		String userPwd = params.getString("login_pwd");
		User user = userServer.getUser(userName, userPwd);
		// 判断用户是否存在
		if (user == null) 
			return new Result(CustomErrors.USER_ACC_ERR);
		// 已登录 则删除当前登录状态，和所有队列的通知消息
		if (user.getToken() != null && !user.getToken().isEmpty()) {
			RedisUtil.del("user_" + user.getToken()); 
			RedisUtil.del("queue_" + user.getToken()); 
			RedisUtil.del("queue_" + user.getToken() + "_m"); 
		}
		// 已注销，不可登录
		if (user.getUserInfo().getDestroy()) 
			return new Result(CustomErrors.USER_DESTROY);
		// 用户服务状态已过期
		if (user.getUserInfo().getServerEnd() < System.currentTimeMillis())
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
		
		user.getUserInfo().setUserPwd(null);
		Map<Object, Object> userMap = new HashMap<Object, Object>();
		userMap.put("uid", user.getId());
		userMap.put("userInfo", JSONObject.fromObject(user.getUserInfo()).toString());
		userMap.put("token", new_token);
		userMap.put("loginTime", String.valueOf(new Date().getTime()));
		userMap.put("loginIP", ip);
		try {
			RedisUtil.set("user_" + new_token, BaseServer.JSON_MAPPER.writeValueAsString(userMap));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		
		return new DataResult(Errors.OK, new Data(user));
	}
	
	@Pipe("getUserInfo")
	@BarScreen(
		desc="获取用户信息",
		params = {
			@Parameter(type=TokenParam.class)
		}
	)
	public Errcode getUserInfo (JSONObject params) {
		String key = "user_" + params.getString("token");
		if (!(RedisUtil.exists(key))) 
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		
		Map<String, Object> data = Collections.emptyMap();
		Map<String, String> userMap = RedisUtil.hgetall(key);
		data.put("loginTime", Long.valueOf(userMap.get("loginTime").toString()));
		data.put("userInfo", JSONObject.fromObject(userMap.get("userInfo")));
		return new DataResult(Errors.OK, new Data(data));
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
		RedisUtil.del(key); // 删除缓存
		return new DataResult(Errors.OK);
	}
}