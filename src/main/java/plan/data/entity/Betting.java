package plan.data.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.Data;

@Data
@Document(collection = "plan_betting")
public class Betting {

	@Id
	@Field(value = "_id")
	private String id;
	@Field
	private String periods;
	@Field
	private int position;
	@Field
	private int ds;

	/**
	 * 1已中奖 2未中奖 3未开奖 4已撤销
	 */
	@Field
	private int state;
	@Field
	private String result;
	@Field
	private String userIds;
	@Field
	private String createTime;

}
