package plan.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;

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
	/** 用户token */
	@Field
	private String token;
}
