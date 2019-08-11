package plan.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;
import plan.service.utils.Tools;

/**
 * 用户
 * 
 * @author wr
 *
 */
@Data
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
	@Field
	private Boolean state;
	@Field
	private int periods;
	@Field
	private int nowPeriods;
	/** 用户token */
	@Field
	private String token;
	
	public User() {}
	public User(String userName, String userPwd, String endTime, int periods) {
		this.userName = userName;
		this.userPwd = userPwd;
		this.createTime = Tools.getTimestamp();
		this.endTime = endTime;
		this.state = true;
		this.periods = periods;
		this.nowPeriods = 0;
		this.token = "";
	}
}
