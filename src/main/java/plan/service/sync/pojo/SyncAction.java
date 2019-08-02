package plan.service.sync.pojo;

import plan.server.BaseServer;

/**  
* @ClassName: SyncAction  
* @Description: 同步消息操作枚举
* @author Crap  
* @date 2019年3月18日  
*    
*/  

public interface SyncAction {

	interface Action {}
	
	enum LOTTERY implements Action {
		//下注
		BET,
		//撤销
		REVOKE
    }
	
    enum USER implements Action {
    	//更新计划期数
    	UPDATE
    }
    
    public static void main(String[] args) throws Exception {
    	SyncMsg msg = new SyncMsg(SyncAction.LOTTERY.BET);
    	System.out.println(BaseServer.JSON_MAPPER.writeValueAsString(msg));
	}
}
