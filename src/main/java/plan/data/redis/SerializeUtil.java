package plan.data.redis;


import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.util.Base64;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.util.StringUtils;

public class SerializeUtil {

	private static Logger log = LogManager.getLogger(SerializeUtil.class);


	/**
	 * 反序列化
	 * @param str 待序列化的字符串
	 * @return
	 */
	public static Object deserialize(String str) {
		ByteArrayInputStream bis = null;
		ObjectInputStream ois = null;
		try {
			if (StringUtils.isEmpty(str)) {
				return  null;
			}
			bis = new ByteArrayInputStream(Base64.getDecoder().decode(str));
			ois = new ObjectInputStream(bis);
			return ois.readObject();
		} catch (Exception e) {
			throw new RuntimeException("deserialize session error", e);
		} finally {
			try {
				if(ois != null) {
					ois.close();
				}
				if (bis != null) {
					bis.close();
				}
			} catch (IOException e) {
				log.error("反序列化字符串异常",e);
			}

		}
	}

	/**
	 * 对象序列化
	 * @param obj 待序列化的对象
	 * @return
	 */
	public static String serialize(Object obj) {
		ByteArrayOutputStream bos = null;
		ObjectOutputStream oos = null;
		try {
			bos = new ByteArrayOutputStream();
			oos = new ObjectOutputStream(bos);
			oos.writeObject(obj);
			return Base64.getEncoder().encodeToString(bos.toByteArray());
		} catch (Exception e) {
			throw new RuntimeException("serialize session error", e);
		} finally {
			try {
				oos.close();
				bos.close();
			} catch (IOException e) {
				log.error("序列化字符串异常",e);
			}

		}
	}
}
