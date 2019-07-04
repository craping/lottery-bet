package plan.server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import plan.data.redis.RedisUtil;

@Service
public class BaseServer {
	
	public static ObjectMapper JSON_MAPPER = new ObjectMapper();
	static{
		JSON_MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
		JSON_MAPPER.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
		JSON_MAPPER.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		JSON_MAPPER.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
	}
	@Autowired
	protected RedisUtil redisUtil;
	
	/**
	 *  判断是否登录
	 * @param token
	 * @return
	 */
	public Boolean userLogged(String token) {
		// 用户没有token -> 未登录
		if (token == null || token.isEmpty())
			return false;
		// redis 没有查询到 ->未登录
		String key = "user_" + token;
		if (!(new RedisUtil().exists(key))) 
			return false;
		
		return true;
	}
}
