package plan.service;

import org.crap.jrain.core.bean.result.Errcode;

public enum CustomErrors implements Errcode {
	
	USER_OPR_ERR(1,100, "操作失败"),
	USER_LOGIN_UPDATE_TOKEN_EX(1,101, "登录失败，请联系管理员"),

	USER_PARAM_NULL(1,500, "请求错误，缺少参数<{}>"),
	USER_ACC_ERR(1,501, "用户名或密码错误"),
	USER_PWD_ERR(1,502, "用户密码错误"),
	USER_CHANGE_PWD_ERR(1,503, "确认密码不一致"),
	USER_LOCKED_ERR(1,504, "用户已关闭，请联系管理员"),
	USER_NOT_LOGIN(1,506, "用户未登录"),
	USER_SERVER_END(1,507, "服务已过期，请联系管理员"),
	USER_EXIST_ERR(1,508, "用户<{}>已注册"),
	USER_NOT_EXIST(1,509, "用户不存在"),
	USER_DESTROY(1,510, "用户已注销，请联系管理员"),
	USER_NO_ROLE(1,511, "访问失败，没有权限"),
	USER_BETTING_ERR(1,512, "投注信息不存在"),
	
	USER_LOCKED(1,999, "状态异常，请联系管理员");
	
	
	public int result;
	public int errCode;
	public String errMsg;
	private Object args[];

	private CustomErrors(int result, int errCode, String errMsg) {
		this.result = result;
		this.errCode = errCode;
		this.errMsg = errMsg;
	}

	@Override
	public int getResult() {
		return this.result;
	}

	@Override
	public int getErrcode() {
		return this.errCode;
	}

	@Override
	public String getMsg() {
		if (args != null && args.length > 0) {
			String errMsg = this.errMsg;
			for (Object arg : args) {
				if(errMsg.indexOf("{}") != -1) {
					errMsg = errMsg.substring(0, errMsg.indexOf("{}")).concat(arg.toString()).concat(errMsg.substring(errMsg.indexOf("{}") + 2));
				}
			}
			return errMsg;
		} else {
			return this.errMsg;
		}
	}

	public Object[] getArgs() {
		return args;
	}

	public Errcode setArgs(Object... args) {
		this.args = args;
		return this;
	}
}
