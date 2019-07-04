package plan.service.sync.pojo;

  
/**  
* @ClassName: SyncAction  
* @Description: 同步消息操作枚举
* @author Crap  
* @date 2019年3月18日  
*    
*/  
    
public enum SyncAction {
	  
	/**  添加操作 */  
	ADD,
	/**  修改操作 */  
	MOD,
	/**  删除操作 */  
	DEL,
	/**  设置操作 */  
	SET,
	/** 注销用户 */
	DESTROY,
	/** 开启关闭机器人 */
	LOCK,
	/** 修改服务时间 */
	SERVER_TIME
}
