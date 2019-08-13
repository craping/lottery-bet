package plan.service.pump;

import java.io.IOException;
import java.security.interfaces.RSAPublicKey;
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
import org.crap.jrain.core.util.PackageUtil;
import org.crap.jrain.core.validate.DataBarScreen;
import org.crap.jrain.core.validate.annotation.BarScreen;
import org.crap.jrain.core.validate.annotation.Parameter;
import org.crap.jrain.core.validate.security.component.Coder;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSONObject;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;
import plan.HttpServer;
import plan.service.param.TokenParam;
import plan.service.sync.SyncContext;
import plan.service.sync.pojo.SyncAction;
import plan.service.sync.pojo.SyncMsg;

@Pump("api")
@Component
public class ApiPump extends DataPump<FullHttpRequest, Channel> {
	
	public static final Logger log = LogManager.getLogger(ApiPump.class);
	
	@Pipe("apiDocument")
	@BarScreen(desc="API文档")
	public Errcode api (Map<String, Object> params) throws ErrcodeException {
		try {
			String info = PackageUtil.apiResolve("plan", "http://127.0.0.1:"+HttpServer.PORT);
			log.info("info:"+info);
			return new DataResult(Errors.OK, new Data(info));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return new Result(Errors.OK);
	}
	
	@Pipe("getPublicKey")
	@BarScreen(desc="随机获取公钥")
	public Errcode publicKey (JSONObject params) throws ErrcodeException {
		int index = (int)(Math.random()*DataBarScreen.KPCOLLECTION.getTotal());
		RSAPublicKey publicKey = (RSAPublicKey)DataBarScreen.KPCOLLECTION.get(index).getPublic();

		Map<String, Object> key = new HashMap<>();
		key.put("id", index);
		key.put("n", publicKey.getModulus().toString());
		key.put("e", publicKey.getPublicExponent().toString());
		try {
			key.put("publicKey", Coder.encryptBASE64(publicKey.getEncoded()));
		} catch (Exception e) {
			e.printStackTrace();
		}
		return new DataResult(Errors.OK, new Data(key));
	}
	
	@Pipe("sync")
	@BarScreen(
		desc="消息同步接口",
		params= {
			@Parameter(type=TokenParam.class)
		}
	)
	public Errcode sync (JSONObject params) throws ErrcodeException {
		
		return new DataResult(Errors.OK, new Data(params.getString("token")));
	}
	
	@Pipe("put")
	@BarScreen(
		desc="测试队列投放消息",
		params= {
			@Parameter(type=TokenParam.class),
			@Parameter("msg")
		}
	)
	public Errcode put (JSONObject params) throws ErrcodeException {
		SyncMsg msg = new SyncMsg(SyncAction.LOTTERY.BET);
		msg.setData(params.getString("msg"));
		SyncContext.toMsg(params.getString("token"), msg);
		return new DataResult(Errors.OK);
	}
	
	public static void main (String args[]) throws IOException {
		
	}
}
