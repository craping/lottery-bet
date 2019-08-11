package plan.server;

import java.util.List;

import org.crap.jrain.core.ErrcodeException;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import plan.data.entity.Betting;

@Service
public class BettingServer extends BaseServer {

	/**
	 * 新增投注计划
	 * @return
	 * @throws ErrcodeException
	 */
	public Betting insert(Betting betting) throws ErrcodeException {
		return mongoTemplate.insert(betting);
	}
	
	/**
	 * 获取投注列表
	 * @return
	 * @throws ErrcodeException
	 */
	public List<Betting> getBettings() throws ErrcodeException {
		Query query = new Query();
		//query.addCriteria(Criteria.where("state").is(3));
		query.with(new Sort(Direction.DESC, "createTime"));
		return mongoTemplate.find(query, Betting.class);
	}

	/**
	 * 获取最新计划
	 * 
	 * @param id
	 * @return
	 */
	public Betting newBettingInfo() {
		Query query = new Query();
		query.addCriteria(Criteria.where("state").is(3));
		query.with(new Sort(Direction.DESC, "createTime"));
		return mongoTemplate.findOne(query, Betting.class);
	}

	/**
	 * 获取投注详情
	 * 
	 * @param userName
	 * @param userPwd
	 * @return
	 */
	public Betting getBetting(String id) {
		Query query = new Query();
		query.addCriteria(Criteria.where("id").is(id));
		return mongoTemplate.findOne(query, Betting.class);
	}

	/**
	 * 更新用户信息
	 * 
	 * @param user
	 * @return
	 */
	public long modifyBetting(Betting betting) {
		Query query = new Query(Criteria.where("id").is(betting.getId()));
		Update update = Update.update("state", betting.getState());
		return mongoTemplate.updateFirst(query, update, Betting.class).getModifiedCount();
	}
}
