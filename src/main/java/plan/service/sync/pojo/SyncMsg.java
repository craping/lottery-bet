package plan.service.sync.pojo;

public class SyncMsg {

	private String biz;

	private String action;

	private Object data;

	public SyncMsg() {
	}
	
	public SyncMsg(SyncAction.Action action) {
		
		if (action != null) {
			this.biz = action.getClass().getSimpleName();
			this.action = action.toString();
		}
	}

	public String getBiz() {
		return biz;
	}

	public String getAction() {
		return action;
	}

	public Object getData() {
		return data;
	}

	public void setData(Object data) {
		this.data = data;
	}

}
