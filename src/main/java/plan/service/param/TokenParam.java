package plan.service.param;

import org.crap.jrain.core.bean.result.Errcode;
import org.crap.jrain.core.bean.result.Result;
import org.crap.jrain.core.error.support.Errors;
import org.crap.jrain.core.validate.exception.ValidationException;
import org.crap.jrain.core.validate.support.param.SingleParam;
import org.crap.jrain.core.validate.support.param.StringParam;

import plan.data.redis.RedisUtil;
import plan.service.CustomErrors;
import redis.clients.jedis.Jedis;

public class TokenParam extends StringParam implements SingleParam {
	
	public TokenParam() {
		this.desc="用户Token";
		this.value = "token";
	}

	
	  
	/* 
	 * 	{token}		PC端token
	*   {token}_m 	_m 后缀手机端token
	*   
	* @param param
	* @return
	* @throws ValidationException  
	* @see org.crap.jrain.core.validate.support.param.StringParam#validateValue(java.lang.Object)  
	*/  
	    
	@Override
	protected Errcode validateValue(Object param) throws ValidationException {
		if(param == null)
			return new Result(CustomErrors.USER_PARAM_NULL.setArgs("token"));
		
		String token = param.toString();
		if (token.isEmpty())
			return new Result(CustomErrors.USER_PARAM_NULL.setArgs("token"));
		
		String key = "user_" + token;
		Jedis jedis = null;
		try {
			jedis = RedisUtil.getJedis();
			//判断缓存是否存在
			if (!jedis.exists(key)) {
				return new Result(CustomErrors.USER_NOT_LOGIN);
			}
		} catch (Exception e) {
			return new Result(Errors.EXCEPTION_UNKNOW, e.getMessage());
		} finally {
			if (jedis != null)
				jedis.close();
		}
		
		
//		if (!(new RedisUtil().hget(key, "locked").equals("0"))) {
//			return new Result(CustomErrors.USER_LOCKED);
//		}
//		
//		long serverEnd = Long.parseLong(new RedisUtil().hget(key, "serverEnd"));
//		if (Tools.isOverTime(serverEnd, 5)) {
//			return new Result(CustomErrors.USER_SERVER_END);
//		}
		
		return Errors.OK;
	}

	@Override
	protected String cast0(Object param) {
		return param.toString();
	}
}
