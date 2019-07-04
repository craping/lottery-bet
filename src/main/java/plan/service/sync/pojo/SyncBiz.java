package plan.service.sync.pojo;

  
/**  
* @ClassName: SyncBiz  
* @Description: 业务类型枚举
* @author Crap  
* @date 2019年3月18日  
*    
*/  
    
public enum SyncBiz {
	/**  登录事件 */
	LOGIN,
	/**  退出事件 */
	LOGOUT,
	/**  用户信息事件 */ 
	USER,
	/**  分群关键词事件 */ 
	KEYWORD,
	/**  分群定时消息事件 */ 
	TIMER,
	/**  联系人事件 */ 
	CONTACT,
	/**  设置事件 */ 
	SETTING,
	/**  状态控制事件 */ 
	SWITCHS,
	/**  提示语事件 */ 
	TIPS,
	/**  权限事件 */ 
	PERMISSIONS,
	/**  公告消息事件 */
	NOTICE
	  
}
