package plan.service.pump;

import java.net.InetSocketAddress;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

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

import com.alibaba.fastjson.JSONObject;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;
import plan.data.entity.User;
import plan.data.redis.RedisUtil;
import plan.server.UserServer;
import plan.service.CustomErrors;
import plan.service.param.TokenParam;
import plan.service.sync.SyncContext;
import plan.service.sync.pojo.SyncAction;
import plan.service.sync.pojo.SyncMsg;
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
			@Parameter(value="endTime",  desc="服务时间"),
			@Parameter(value="periods",  desc="初始期数")
		}
	)
	public Errcode addUser (JSONObject params) throws ErrcodeException {
		User user = new User(params.getString("userName"), Coder.encryptMD5(params.getString("userPwd")), 
				Tools.dateToStamp(params.getString("endTime") + " 00:00:00"), params.getIntValue("periods"));
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
		userMap.put("id", user.getId());
		userMap.put("userName", user.getUserName());
		userMap.put("endTime", user.getEndTime());
		userMap.put("state", String.valueOf(user.getState()));
		userMap.put("periods", String.valueOf(user.getPeriods()));
		userMap.put("nowPeriods", String.valueOf(user.getNowPeriods()));
		userMap.put("token", new_token);
		userMap.put("loginTime", String.valueOf(new Date().getTime()));
		userMap.put("loginIP", ip);
		userMap.put("balance", "0.00");
		redisTemplate.opsForHash().putAll("user_" + new_token, userMap);
//		redisTemplate.expire("user_" + new_token, 20, TimeUnit.SECONDS);
		
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
	
	@Pipe("userInfo")
	@BarScreen(
		desc="获取用户信息",
		params = {
			@Parameter(value="token",  desc="用户token"),
		}
	)
	public Errcode userInfo (JSONObject params) throws ErrcodeException {
		String key = "user_" + params.getString("token");
		if (!RedisUtil.exists(key)) 
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
		return new DataResult(Errors.OK, new Data(userMap));
	}
	
	@Pipe("onlineList")
	@BarScreen(
		desc="获取在线用户列表",
		params = {}
	)
	public Errcode onlineList (JSONObject params) throws ErrcodeException {
		Set<String> keys = redisTemplate.keys("user_*");
		List<Map<Object, Object>> users = new ArrayList<Map<Object,Object>>();
		for(String key : keys){
			Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
			users.add(userMap);
		}
		return new DataResult(Errors.OK, new Data(users));
	}
	
	@Pipe("resetPeriods")
	@BarScreen(
		desc="重置期数",
		params = {
			@Parameter(value="id",  desc="用户id"),
		}
	)
	public Errcode resetPeriods(JSONObject params) {
		User user = userServer.find(params.getString("id"));
		if (user == null)
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		String key = "user_" + user.getToken();
		if (!RedisUtil.exists(key))
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		// 重置期数持久化
		user.setNowPeriods(0);
		userServer.modifyNowPeriods(user);
		
		redisTemplate.opsForHash().put(key, "nowPeriods", "0");

		// 推送队列消息
		SyncMsg msg = new SyncMsg(SyncAction.USER.RESET);
		SyncContext.toMsg(user.getToken(), msg);
		
		return new DataResult(Errors.OK);
	}
	
	@Pipe("modifyPeriods")
	@BarScreen(
		desc="修改期数",
		params = {
			@Parameter(value="id",  desc="用户id"),
			@Parameter(value="periods",  desc="期数"),
		}
	)
	public Errcode modifyPeriods(JSONObject params) {
		User user = userServer.find(params.getString("id"));
		if (user == null)
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		String key = "user_" + user.getToken();
		if (!RedisUtil.exists(key))
			return new Result(CustomErrors.USER_NOT_LOGIN);
		
		// 重置期数持久化
		user.setPeriods(params.getIntValue("periods"));
		userServer.modifyPeriods(user);
		
		redisTemplate.opsForHash().put(key, "periods", params.getString("periods"));

		// 推送队列消息
		SyncMsg msg = new SyncMsg(SyncAction.USER.UPDATE);
		Map<String, Object> data = new HashMap<>();
		data.put("count", params.getIntValue("periods"));
		msg.setData(data);
		SyncContext.toMsg(user.getToken(), msg);
		
		return new DataResult(Errors.OK);
	}
	
	@Pipe("logout")
	@BarScreen(
		desc="用户退出",
		params = {
			@Parameter(type=TokenParam.class)
		}
	)
	public Errcode logout (JSONObject params) {
		String key = "user_" + params.getString("token");
		redisTemplate.delete(key); // 删除缓存
		return new DataResult(Errors.OK);
	}
	
	@Pipe("heartbeat")
	@BarScreen(
		desc="心跳测试",
		params = {
			@Parameter(value="token",  desc="用户token"),
			@Parameter(value="balance", desc="用户余额")
		}
	)
	public Errcode heartbeat(JSONObject params) {
		String token = params.getString("token");
		String key = "user_" + token;
		if (!RedisUtil.exists(key)) {
			User user = userServer.findUserByToken(token);
			if (user == null)
				return new Result(CustomErrors.USER_NOT_LOGIN);
			
			// 插入登录日志 
			InetSocketAddress insocket = (InetSocketAddress) getResponse().remoteAddress();
			System.out.println("IP:"+insocket.getAddress().getHostAddress());
			String ip = insocket.getAddress().getHostAddress();
			
			Map<Object, Object> userMap = new HashMap<Object, Object>();
			userMap.put("id", user.getId());
			userMap.put("userName", user.getUserName());
			userMap.put("endTime", user.getEndTime());
			userMap.put("state", String.valueOf(user.getState()));
			userMap.put("periods", String.valueOf(user.getPeriods()));
			userMap.put("nowPeriods", String.valueOf(user.getNowPeriods()));
			userMap.put("token", token);
			userMap.put("loginTime", String.valueOf(new Date().getTime()));
			userMap.put("loginIP", ip);
			redisTemplate.opsForHash().putAll(key, userMap);
//			redisTemplate.expire(key, 15, TimeUnit.SECONDS);
		}
		
		redisTemplate.opsForHash().put(key, "balance", params.getString("balance"));
		redisTemplate.expire(key, 15, TimeUnit.SECONDS);
		Map<Object, Object> userMap = redisTemplate.opsForHash().entries(key);
		return new DataResult(Errors.OK, new Data(userMap));
	}
}