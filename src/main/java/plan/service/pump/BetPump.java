package plan.service.pump;

import java.io.IOException;
import java.util.Arrays;
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
import org.crap.jrain.core.validate.annotation.BarScreen;
import org.crap.jrain.core.validate.annotation.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSONObject;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;
import plan.data.entity.Betting;
import plan.data.entity.User;
import plan.data.redis.RedisUtil;
import plan.server.BettingServer;
import plan.server.UserServer;
import plan.service.CustomErrors;
import plan.service.sync.SyncContext;
import plan.service.sync.pojo.SyncAction;
import plan.service.sync.pojo.SyncMsg;
import plan.service.utils.Tools;
import plan.service.utils.XYFTUtil;

@Pump("bet")
@Component
public class BetPump extends DataPump<FullHttpRequest, Channel> {
	
	public static final Logger log = LogManager.getLogger(BetPump.class);
	
	@Autowired
	private UserServer userServer;
	@Autowired
	private BettingServer bettingServer;
	@Autowired
	private StringRedisTemplate redisTemplate;
	
	@Pipe("bettings")
	@BarScreen(
		desc="获取投注列表",
		params = {}
	)
	public Errcode bettings(JSONObject params) throws ErrcodeException {
		return new DataResult(Errors.OK, new Data(bettingServer.getBettings()));
	}
	
	@Pipe("openBet")
	@BarScreen(
		desc="开奖",
		params = {
			@Parameter(value="id",  desc="投注id"),
			@Parameter(value="index",  desc="标识"),
		}
	)
	public Errcode openBet(JSONObject params) throws ErrcodeException {
		Betting betting = bettingServer.getBetting(params.getString("id"));
		int state = params.getIntValue("index"); 
		if (state == 0) {
			// 已中奖 重置用户投注信息
			String ids = betting.getUserIds();
			for(String id : ids.split(",")) {
				User user = userServer.find(id);
				String token = user.getToken();
				String key = "user_" + token;
				if (RedisUtil.exists(key)) {
					// 发起投注队列消息
					//SyncContext.toMsg(token, msg);
					
					// 持久化期数进度
					user.setNowPeriods(0);
					userServer.modifyNowPeriods(user);
					
					// 修改期数进度
					redisTemplate.opsForHash().put(key, "nowPeriods", String.valueOf(user.getNowPeriods()));
				}
			}
		}
		
		betting.setState(state);
		bettingServer.modifyBetting(betting);
		return new DataResult(Errors.OK, new Data(bettingServer.getBettings()));
	}
	
	@Pipe("cancel")
	@BarScreen(
		desc="撤销投注",
		params = {
			@Parameter(value="id",  desc="投注id"),
		}
	)
	public Errcode cancel(JSONObject params) throws ErrcodeException {
		Betting betting = bettingServer.getBetting(params.getString("id"));
		if (betting == null)
			return new Result(CustomErrors.USER_BETTING_ERR);
		
		betting.setState(3);
		bettingServer.modifyBetting(betting);
		
		// 推送队列消息
		String userIds = betting.getUserIds();
		SyncMsg msg = new SyncMsg(SyncAction.LOTTERY.REVOKE);
		
		for(String id : userIds.split(",")) {
			User user = userServer.find(id);
			String token = user.getToken();
			String key = "user_" + token;
			if (RedisUtil.exists(key)) {
				// 发起投注队列消息
				SyncContext.toMsg(token, msg);
			}
		}

		return new DataResult(Errors.OK);
	}
	
	@Pipe("syncCancel")
	@BarScreen(
		desc="撤单同步",
		params= {
			@Parameter(value="token",  desc="用户token"),
			@Parameter(value="success",  desc="撤单成功标识"),
		}
	)
	public Errcode syncCancel(JSONObject params) throws ErrcodeException {
		Boolean success = params.getBoolean("success");
		if (success) {
			String token = params.getString("token");
			String key = "user_" + token;
			if (RedisUtil.exists(key)) {
				String id = String.valueOf(redisTemplate.opsForHash().get(key, "id"));
				User user = userServer.find(id);
				
				// 持久化期数进度
				user.setNowPeriods(user.getNowPeriods() - 1);
				userServer.modifyNowPeriods(user);
				
				// 修改期数进度
				redisTemplate.opsForHash().put(key, "nowPeriods", String.valueOf(user.getNowPeriods()));
			}
		} 		
		return new DataResult(Errors.OK);
	}
	
	
	@Pipe("betting")
	@BarScreen(
		desc="投注",
		params= {
			@Parameter(value="periods",  desc="期号"),
			@Parameter(value="position",  desc="位置"),
			@Parameter(value="ds",  desc="单双"),
			@Parameter(value="ids", desc="用户")
		}
	)
	public Errcode betting(JSONObject params) throws ErrcodeException {
		
		// 用户id
		String ids = params.getString("ids").replace("[", "").replace("]", "").replace("\"", "");
		
		Betting betting = new Betting();
		betting.setPeriods(params.getString("periods"));
		betting.setPosition(params.getIntValue("position"));
		betting.setDs(params.getIntValue("ds"));
		betting.setUserIds(ids);
		betting.setState(4);
		betting.setCreateTime(Tools.getTimestamp());
		betting = bettingServer.insert(betting);
		
		Map<Object, Object> betMap = new HashMap<Object, Object>();
		betMap.put("id", betting.getId());
		betMap.put("period", betting.getPeriods());
		betMap.put("position", params.getString("position"));
		betMap.put("ds", params.getString("ds"));
		
		String code = params.getIntValue("ds") == 1? "单":"双";
		betMap.put("code", code);
		betMap.put("ids", ids);
		redisTemplate.opsForHash().putAll("betting_info", betMap);		
		
		SyncMsg msg = new SyncMsg(SyncAction.LOTTERY.BET);
		Map<String, Object> data = new HashMap<>();
		data.put("period", betting.getPeriods());
		data.put("code", code);
		data.put("position", params.getIntValue("position"));
		msg.setData(data);
		
		for(String id : Arrays.asList(ids.split(","))) {
			User user = userServer.find(id);
			String token = user.getToken();
			String key = "user_" + token;
			if (RedisUtil.exists(key)) {
				// 发起投注队列消息
				SyncContext.toMsg(token, msg);
			}
		}
		
		return new DataResult(Errors.OK);
	}
	
	@Pipe("syncBetting")
	@BarScreen(
		desc="投注成功同步",
		params= {
			@Parameter(value="token",  desc="用户token"),
			@Parameter(value="success",  desc="投注成功标识"),
		}
	)
	public Errcode syncBetting(JSONObject params) throws ErrcodeException {
		Boolean success = params.getBoolean("success");
		if (success) {
			String token = params.getString("token");
			String key = "user_" + token;
			if (RedisUtil.exists(key)) {
				String id = String.valueOf(redisTemplate.opsForHash().get(key, "id"));
				User user = userServer.find(id);
				
				// 持久化期数进度
				user.setNowPeriods(user.getNowPeriods() + 1);
				userServer.modifyNowPeriods(user);
				
				// 修改期数进度
				redisTemplate.opsForHash().put(key, "nowPeriods", String.valueOf(user.getNowPeriods()));
			}
		} 		
		return new DataResult(Errors.OK);
	}
	
	@Pipe("getXYFTPeriods")
	@BarScreen(
		desc="获取当前期号"
	)
	public Errcode getXYFTPeriods(JSONObject params) throws ErrcodeException {
		String args[] = XYFTUtil.XYFTresult().getPeriod().split("-");
		String periods = args[0] + "-" + String.format("%03d", (Integer.parseInt(args[1]) + 1));
		return new DataResult(Errors.OK, new Data(periods));
	}
	
	@Pipe("newBettingInfo")
	@BarScreen(
		desc="获取最新期计划",
		params= {
			@Parameter(value="id",  desc="用户id")
		}
	)
	public Errcode newBettingInfo(JSONObject params) throws ErrcodeException {
		Betting betting = bettingServer.newBettingInfo();
		if (!Arrays.asList(betting.getUserIds().split(",")).contains(params.getString("id")))
			return new Result(CustomErrors.USER_NO_ROLE);
			
		betting.setUserIds("");
		return new DataResult(Errors.OK, new Data(betting));
	}
	
	public static void main (String args[]) throws IOException {
		//Long periods = Long.valueOf(XYFTUtil.XYFTresult().getPeriod().replace("-", "")) + 1;
		String a = "5d3d508b76785a3ad03b8d42,5d46745676785a5028599f42";
		String b = "5d46745676785a5028599f421";
		System.out.println(Arrays.asList(a.split(",")));
		System.out.println(Arrays.asList(a.split(",")).contains(b));
		String periods = "20190909-111";
		int p = Integer.parseInt(periods.split("-")[1]) + 1;
		System.out.println(p);
	}
}
