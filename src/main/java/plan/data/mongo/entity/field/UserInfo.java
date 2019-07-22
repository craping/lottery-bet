package plan.data.mongo.entity.field;

import lombok.Data;

/**
 * 用户基本信息
 * 
 * @author wr
 */
@Data
public class UserInfo {

	public UserInfo() {
	}

	public UserInfo(String userName, String userPwd, String phoneNum) {
		this.userName = userName;
		this.userPwd = userPwd;
		this.phoneNum = phoneNum;
		this.serverState = true;
		this.phoneState = false;
		this.comefrom = 1;
	}

	private String userName;
	private String userPwd;
	/** 昵称 */
	private String nickName;
	private long regTime;
	/** 软件到期时间 */
	private long serverEnd;
	/** 软件服务状态 */
	private Boolean serverState;
	/** 注销标识 */
	private Boolean destroy = false;
	private String phoneNum;
	/** 手机认证状态 */
	private Boolean phoneState = false;
	/** 帐号来源0管理员添加，1注册 */
	private int comefrom = 0;
	private String regIp;
}
