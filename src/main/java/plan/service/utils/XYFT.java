package plan.service.utils;

/**
 * pk10 开奖结果vo
 * 
 * @author wr
 *
 */
public class XYFT {

	/** 期号 */
	private String period;
	/** 开奖结果 */
	private String[] result;
	/** 冠亚和值 */
	private String gyh;
	/** 冠亚和值大小 */
	private String gyhdx;
	/** 冠亚和值单双 */
	private String gyhds;
	/** 前五龙虎 */
	private String[] lh;

	public String getPeriod() {
		return period;
	}

	public void setPeriod(String period) {
		this.period = period;
	}

	public String[] getResult() {
		return result;
	}

	public void setResult(String[] result) {
		this.result = result;
	}

	public String getGyh() {
		return gyh;
	}

	public void setGyh(String gyh) {
		this.gyh = gyh;
	}

	public String getGyhdx() {
		return gyhdx;
	}

	public void setGyhdx(String gyhdx) {
		this.gyhdx = gyhdx;
	}

	public String getGyhds() {
		return gyhds;
	}

	public void setGyhds(String gyhds) {
		this.gyhds = gyhds;
	}

	public String[] getLh() {
		return lh;
	}

	public void setLh(String[] lh) {
		this.lh = lh;
	}
}