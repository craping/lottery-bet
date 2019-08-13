package plan.service.utils;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import com.alibaba.fastjson.JSONObject;


public class XYFTUtil {
	
	public static final Logger log = LogManager.getLogger(XYFTUtil.class);

	public static XYFT XYFTresult() {
		Document doc = null;
		try {
			doc = Jsoup.connect("https://www.1392p.com/xyft/?utp=topbar").get();
		} catch (IOException e) {
			log.error("数据抓取异常：", e);
			e.printStackTrace();
			return null; 
		}
		Elements els = doc.select("#history tbody tr");	
		Element el = els.get(0);
		
		XYFT vo = new XYFT();
		vo.setPeriod(el.select(".font_gray666").text());
		vo.setGyh(el.select("td:nth-child(3)").text());
		vo.setGyhdx(el.select("td:nth-child(4)").text());
		vo.setGyhds(el.select("td:nth-child(5)").text());
		String[] lh = new String[]{ // 龙虎
			el.select("td:nth-child(6)").text(),
			el.select("td:nth-child(7)").text(),
			el.select("td:nth-child(8)").text(),
			el.select("td:nth-child(9)").text(),
			el.select("td:nth-child(10)").text()	
		};
		vo.setLh(lh);
		vo.setResult(el.select(".number_pk10 span").text().replace(" ", ",").split(","));
		return vo;
	}
	
	public static void main(String args[]) throws IOException {
		System.out.println(JSONObject.toJSONString(XYFTresult()));
	}
}
