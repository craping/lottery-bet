package plan.service.utils;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Base64;
import java.util.Base64.Decoder;
import java.util.Base64.Encoder;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * 描述：基础操作函数集合
 */
@SuppressWarnings({ "rawtypes" })
public class Tools {

	// private final Logger logger = LoggerFactory.getLogger(getClass());

	/**
	 * 排序 获得 Aa-Zz akey=avalue&bkey=bvalue
	 * 
	 * @param str userid=1025499&storeid=1037833
	 * @return
	 */
	public static Map getContentForString(String str) {
		String[] strs = str.split("&");
		Map<String, String> params = new HashMap<>();
		for (int i = 0; i < strs.length; i++) {
			String key = strs[i].split("=")[0];
			String value = strs[i].split("=")[1];
			params.put(key, value);
		}
		return params;
	}

	/**
	 * 排序 获得 Aa-Zz akey=avalue&bkey=bvalue
	 * 
	 * @param str userid=1025499&storeid=1037833
	 * @return
	 */
	public static Map getContent(String str) {
		String[] strs = str.split("&");
		Map<String, Object> params = new HashMap<>();
		for (int i = 0; i < strs.length; i++) {
			String key = strs[i].split("=")[0];
			String value = strs[i].split("=")[1];
			params.put(key, value);
		}
		return params;
	}

	/**
	 * HashMap按值进行排序
	 * 
	 * @param map
	 * @return
	 */
	public static <K, V extends Comparable<? super V>> Map<K, V> sortByValue(Map<K, V> map) {
		List<Map.Entry<K, V>> list = new LinkedList<Map.Entry<K, V>>(map.entrySet());
		Collections.sort(list, new Comparator<Map.Entry<K, V>>() {
			public int compare(Map.Entry<K, V> o1, Map.Entry<K, V> o2) {
				return (o1.getValue()).compareTo(o2.getValue());
			}
		});

		Map<K, V> result = new LinkedHashMap<K, V>();
		for (Map.Entry<K, V> entry : list) {
			result.put(entry.getKey(), entry.getValue());
		}
		return result;
	}

	/**
	 * 检查字符串是否为空；如果字符串为null,或空串，或全为空格，返回true;否则返回false
	 * 
	 * @param str
	 * @return
	 */
	public static boolean isStrEmpty(String str) {
		if ((str != null) && (str.trim().length() > 0)) {
			return false;
		} else {
			return true;
		}
	}

	/**
	 * @param str 1:a,2:b,3:c
	 * @return
	 */
	public static Map<String, String> split(String str) {
		Map<String, String> result = new HashMap<>();
		String[] first = str.split(",");
		for (int i = 0; i < first.length; i++) {
			String[] second = first[i].split(":");
			result.put(second[0], second[1]);
		}
		return result;
	}

	/**
	 * 以字符串的格式取系统时间;格式：YYYYMMDDHHMMSS
	 * 
	 * @return 时间字符串
	 */
	public static String getSysTime() {
		java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyyMMddHHmmss");
		return df.format(new java.util.Date());
	}

	/**
	 * 以字符串的格式取系统日期;格式：YYYYMMDD
	 * 
	 * @return 日期字符串
	 */
	public static String getSysDate() {
		java.text.SimpleDateFormat df = new java.text.SimpleDateFormat("yyyyMMdd");
		return df.format(new java.util.Date());
	}

	public static String getYesterday(String format) {
		Date d1 = new Date();
		long myTime = (d1.getTime() / 1000) - 60 * 60 * 24;
		d1.setTime(myTime * 1000);
		SimpleDateFormat simpleFormat = new SimpleDateFormat(format, Locale.getDefault());
		return simpleFormat.format(d1);
	}

	/**
	 * 按输入的时间格式获取时间串
	 * 
	 * @param format ： 时间的格式 ， 如：yyyy-MM-dd HH:mm:ss ， yyyyMMddHHmmss
	 * @return ： 时间字符串
	 */
	public static String getSysTimeFormat(String format) {
		java.text.SimpleDateFormat df = new java.text.SimpleDateFormat(format);
		return df.format(new java.util.Date());
	}

	/**
	 * 判断字符串是否是有效的日期字符
	 * 
	 * @param d      需要判断的日期字符串
	 * @param format java日期格式
	 * @return true:有效日期 false：无效日期
	 */
	public static boolean isDay(String d, String format) {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat(format);
			sdf.setLenient(false);
			sdf.parse(d);
		} catch (Exception e) {
			return false;
		}
		return true;
	}

	/**
	 * 判断字符串的日期是否已经超过当前系统时间
	 * 
	 * @param d      需要判断的日期字符串
	 * @param format java日期格式
	 * @return true:已过期 false：未过期
	 */
	public static boolean isOverTime(String d, String format) {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat(format);
			sdf.setLenient(false);
			Date date = sdf.parse(d);
			Date sys = new Date();

			if (sys.compareTo(date) == -1) {
				return false;
			}
		} catch (Exception e) {
			return true;
		}
		return true;
	}

	/**
	 * 校验时间是否过期
	 * 
	 * @param verifyTime 时间戳：IOS 安卓 10位
	 * @param limit      超时单位：分钟
	 * @return
	 */
	public static boolean isOverTime(Long verifyTime, int limit) {
		long currentTimeSecond = Long.parseLong(String.valueOf(System.currentTimeMillis()).toString().substring(0, 13));
		verifyTime = Long.parseLong(String.valueOf(verifyTime));
		Long IntervalTime = (currentTimeSecond - verifyTime);
		if (IntervalTime > (limit * 60)) {
			return true;
		}
		return false;
	}

	/**
	 * 判断字符串的日期与当前系统时间是否已经超过指定的时间差
	 * 
	 * @param d      需要判断的日期字符串
	 * @param format java日期格式
	 * @param limit  时间差 秒
	 * @return true:已过期 false：未过期
	 */
	public static boolean isOverTimeLimit(String d, String format, long limit) {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat(format);
			sdf.setLenient(false);
			Date date = sdf.parse(d);
			long now = System.currentTimeMillis();
			long base = date.getTime();

			if ((now - base) > (limit * 1000)) {
				return true;
			}
		} catch (Exception e) {
			return true;
		}
		return false;
	}

	/**
	 * 判断是否是正确的日期
	 * 
	 * @param d String 需要判断的日期字符串
	 * @return boolean
	 */
	public static boolean isDay(String d) {
		int len;
		if (d != "") {
			len = d.length();
		} else {
			return true;
		}

		if (len == 0) {
			return true;
		}
		if (len != 8) {
			return false;
		}

		int year, month, day;

		try {
			year = Integer.parseInt(d.substring(0, 4));
			month = Integer.parseInt(d.substring(4, 6));
			day = Integer.parseInt(d.substring(6, 8));
		} catch (NumberFormatException e) {
			return false;
		}

		if (!((1 <= month) && (12 >= month) && (31 >= day) && (1 <= day))) {
			return false;
		}
		if (!((year % 4) == 0) && (month == 2) && (day == 29)) {
			return false;
		}
		if ((month <= 7) && ((month % 2) == 0) && (day >= 31)) {
			return false;
		}
		if ((month >= 8) && ((month % 2) == 1) && (day >= 31)) {
			return false;
		}
		if ((month == 2) && (day == 30)) {
			return false;
		}
		return true;
	}

	/**
	 * base64解码
	 * 
	 * @param ss String 原字符串
	 * @return String base64解码后的字符串
	 */
	public static String base64Decoder(final String ss) {
		try {
			Decoder decoder = Base64.getDecoder();
			return new String(decoder.decode(ss));
		} catch (Exception e) {
			return "";
		}
	}

	/**
	 * base64编码
	 * 
	 * @param ss String 原字符串
	 * @return String base64编码后的字符串
	 */
	public static String base64Encoder(final String ss) {
		Encoder encoder = Base64.getEncoder(); // base64编码
		return encoder.encodeToString(ss.getBytes());
	}

	/**
	 * 取得长整形转化的字符串
	 * 
	 * @param length int 位数。最长10位
	 * @return String
	 */
	public static String getRandomInt(int length) {
		int iMax = (int) (Math.pow(10, length) - Math.pow(10, length - 1) - 1);
		Random random = new Random();
		int iRandom = random.nextInt(iMax) + (int) Math.pow(10, length - 1);
		if (iRandom < 0) {
			iRandom = (-iRandom);
		}
		return Integer.toString(iRandom);
	}

	private static long jExt = 1;
	private static long pre = System.currentTimeMillis();

	/**
	 * 获取不重复的流水号
	 * 
	 * @return String 流水号
	 */
	public static synchronized String getJournal() {
		long now = System.currentTimeMillis();
		if (now == pre) {
			return (now + "" + jExt++);
		} else {
			pre = now;
			jExt = 1;
			return (now + "");
		}
	}

	/**
	 * 获取全局唯一标识符
	 * 
	 * @return
	 */
	public static String getUuid() {
		UUID uuid = UUID.randomUUID();
		return uuid.toString();
	}

	/**
	 * 格式化数字串
	 * 
	 * @param number 数字字符串
	 * @param format java数字格式， 如："#######0.00"
	 * @return 格式化好的字符串
	 */
	public static String numberFomat(String number, String format) {

		if (number == null)
			number = "";

		String checkExpressions = "^[\\-\\d\\.]+$";
		// 把包含.和数字以外的字符先行过滤掉
		// 如:12f,12.13d等
		if (!Pattern.matches(checkExpressions, number)) {
			throw new java.lang.NumberFormatException();
		}

		DecimalFormat df = new DecimalFormat(format);
		return df.format(Double.parseDouble(number));
	}

	/**
	 * 
	 * 功能：将数据库中查询出来的日期格式 yyyy-mm-dd hh24:mi:ss 转换成 yyyymmddhh24miss
	 * 
	 * @param date yyyy-mm-dd hh24:mi:ss的字符串
	 * @return yyyymmddhh24miss的字符串
	 */
	public static String dbToJavaDate(String date) {
		if (isStrEmpty(date)) {
			return "";
		}
		String tmp = new String(date);
		tmp = tmp.replaceAll("-", "");
		tmp = tmp.replaceAll(":", "");
		tmp = tmp.replaceAll(" ", "");
		return tmp;
	}

	/**
	 * 检查数字串格式，使用于检查金额，费率等
	 * 
	 * @param data    要检查的数据
	 * @param iDotPos 允许小数位，0为没有小数点
	 * @param b0isErr 值为0时返回错
	 * @return ： 0－格式正确， 其他－格式错误
	 */
	public static int iCheckNumber(String data, int iDotPos, boolean b0isErr) {
		if (isStrEmpty(data)) {
			return 1;
		}
		boolean bDot = false;
		for (int i = data.length() - 1; i >= 0; i--) {
			char oneChar = data.charAt(i);
			// 检查小数点
			if ((oneChar == '.') && (!bDot)) {
				if ((data.length() - 1 - i) > iDotPos) {
					return 2;
				}
				bDot = true;
				continue;
			}
			// 若开始为'-',为负数
			if ((oneChar == '-') && (i == 0)) {
				continue;
			}
			if (oneChar < '0' || oneChar > '9') {
				return 3;
			}
		}
		if (b0isErr) {
			double dd = Double.parseDouble(data);
			if (dd == 0) {
				return 4;
			}
		}
		return 0;
	}

	/**
	 * 检查字符串是否只是由数字或字母组成
	 * 
	 * @param str 需要被检查的字符串
	 * @return ： true－被检查的串中只有数字或字母，false-含有其它字符
	 */
	public static boolean checkNumOrLetter(String str) {
		if (str == null) {
			return false;
		}
		String checkExpressions;
		checkExpressions = "^[a-zA-Z0-9]+$";
		return Pattern.matches(checkExpressions, str);
	}

	/**
	 * 检查字符串是否表示金额，此金额小数点后最多带2位
	 * 
	 * @return ： true－表示金额，false-不表示金额
	 */
	public static boolean checkAmount(String amount) {
		if (amount == null) {
			return false;
		}
		String checkExpressions;
		checkExpressions = "^([1-9]\\d*|[0])\\.\\d{1,2}$|^[1-9]\\d*$|^0$";
		return Pattern.matches(checkExpressions, amount);
	}

	/**
	 * 功能：检查传入字符串是否为手机号码 检查规则:13或15开头后面9位数字
	 * 
	 * @param mobileNo
	 * @return
	 */
	public static boolean isMobileNo(String mobileNo) {
		if (mobileNo == null) {
			return false;
		}
		String checkExpressions;
		checkExpressions = "^[1][23456789]\\d{9}$";
		return Pattern.matches(checkExpressions, mobileNo);
	}

	/**
	 * 根据 timestamp 生成各类时间状态串
	 * 
	 * @param timestamp 距1970 00:00:00 GMT的秒数
	 * @return 时间状态串(如：刚刚5分钟前)
	 */
	public static String getTimeState(String timestamp) {
		if (timestamp == null || "".equals(timestamp)) {
			return "";
		}
		try {
			long _timestamp = Long.parseLong(timestamp);
			if (System.currentTimeMillis() - _timestamp < 1 * 60 * 1000) {
				return "刚刚";
			} else if (System.currentTimeMillis() - _timestamp < 30 * 60 * 1000) {
				return ((System.currentTimeMillis() - _timestamp) / 1000 / 60) + "分钟前";
			} else {
				Calendar now = Calendar.getInstance();
				Calendar c = Calendar.getInstance();
				c.setTimeInMillis(_timestamp);
				if (c.get(Calendar.YEAR) == now.get(Calendar.YEAR) && c.get(Calendar.MONTH) == now.get(Calendar.MONTH)
						&& c.get(Calendar.DATE) == now.get(Calendar.DATE)) {
					SimpleDateFormat sdf = new SimpleDateFormat("今天 HH:mm");
					return sdf.format(c.getTime());
				}
				if (c.get(Calendar.YEAR) == now.get(Calendar.YEAR) && c.get(Calendar.MONTH) == now.get(Calendar.MONTH)
						&& c.get(Calendar.DATE) == now.get(Calendar.DATE) - 1) {
					SimpleDateFormat sdf = new SimpleDateFormat("昨天 HH:mm");
					return sdf.format(c.getTime());
				} else if (c.get(Calendar.YEAR) == now.get(Calendar.YEAR)) {
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy年MM月dd日 HH:mm:ss");
					return sdf.format(c.getTime());
				} else {
					SimpleDateFormat sdf = new SimpleDateFormat("yyyy年M月d日 HH:mm:ss");
					return sdf.format(c.getTime());
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			return "";
		}
	}

	/**
	 * 将时间转换为时间戳
	 * @param dateStr
	 * @return
	 */
	public static String dateToStamp(String dateStr) {
		String res;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = new Date();
		try {
			date = simpleDateFormat.parse(dateStr);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		long ts = date.getTime();
		res = String.valueOf(ts);
		return res;
	}

	/**
	 * 将时间转换为时间戳
	 * 
	 * @param dateStr
	 * @param format
	 * @return
	 */
	public static String dateToStamp(String dateStr, String format) {
		String res;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat(format);
		Date date = new Date();
		try {
			date = simpleDateFormat.parse(dateStr);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		long ts = date.getTime();
		res = String.valueOf(ts);
		return res;
	}

	/**
	 * 将时间戳转换为时间
	 * 
	 * @param dateStr
	 * @return
	 */
	public static String stampToDate(String dateStr) {
		String res;
		SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		long lt = new Long(dateStr);
		Date date = new Date(lt);
		res = simpleDateFormat.format(date);
		return res;
	}

	/**
	 * 将时间转换为时间戳 UTZ 例：2019-03-19T16:00:00.000Z
	 * 
	 * @param str
	 * @return
	 */
	public static String dateUTCToStamp(String str) {
		str = str.replace("Z", " UTC");// 注意是空格+UTC
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS Z");// 注意格式化的表达式
		Date date = new Date();
		try {
			date = format.parse(str);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return String.valueOf(date.getTime());
	}

	/**
	 * 获取当前时间 时间戳
	 */
	public static String getTimestamp() {
		return String.valueOf(new Date().getTime());
	}

	/**
	 * 获取四位随机数 小写 数字+字母
	 * 
	 * @return
	 */
	public static String generateWord() {
		String[] beforeShuffle = new String[] { "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F",
				"G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z" };
		List list = Arrays.asList(beforeShuffle);
		Collections.shuffle(list);
		StringBuilder sb = new StringBuilder();
		for (int i = 0; i < list.size(); i++) {
			sb.append(list.get(i));
		}
		String afterShuffle = sb.toString();
		String result = afterShuffle.substring(5, 9);
		return result.toLowerCase();
	}

	public static void main(String args[]) throws Exception {
		System.out.println(stampToDate("1564243200000"));
		System.out.println(dateToStamp("2019-07-28 00:00:00"));
		String a = "2019-07-28";
		System.out.println(dateToStamp(a + " 00:00:00"));
//		System.out.println(getTimestamp());
//		System.out.println(stampToDate("1548878771000"));
//		String date = "2019-03-19T16:00:00.000Z";
//		System.out.println(dateUTCToStamp(date));
	}
}
