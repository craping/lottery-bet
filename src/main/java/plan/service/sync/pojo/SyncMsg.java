package plan.service.sync.pojo;

public class SyncMsg {
    
	private SyncBiz biz;
	
	private SyncAction action;
	
	private Object data;

	public SyncBiz getBiz() {
		return biz;
	}

	public void setBiz(SyncBiz biz) {
		this.biz = biz;
	}

	public SyncAction getAction() {
		return action;
	}

	public void setAction(SyncAction action) {
		this.action = action;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}
	
}
