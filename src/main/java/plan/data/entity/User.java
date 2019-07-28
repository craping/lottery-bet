package plan.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * 用户
 * 
 * @author wr
 *
 */
@Document(collection = "plan_user")
public class User {

	@Id
	@Field(value = "_id")
	private String id;
	@Field
	private String userName;
	@Field
	private String userPwd;
	@Field
	private String createTime;
	@Field
	private String endTime;
	/** 用户token */
	@Field
	private String token;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public String getUserPwd() {
		return userPwd;
	}
	public void setUserPwd(String userPwd) {
		this.userPwd = userPwd;
	}
	public String getCreateTime() {
		return createTime;
	}
	public void setCreateTime(String createTime) {
		this.createTime = createTime;
	}
	public String getEndTime() {
		return endTime;
	}
	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	
	
}
