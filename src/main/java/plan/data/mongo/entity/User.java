package plan.data.mongo.entity;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;
import plan.data.mongo.entity.field.UserInfo;

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
	private UserInfo userInfo;
	/** 用户token */
	@Field
	private String token;
}
