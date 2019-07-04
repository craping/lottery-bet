

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.crap.jrain.core.util.FileUtil;
import org.mybatis.generator.api.MyBatisGenerator;
import org.mybatis.generator.config.Configuration;
import org.mybatis.generator.config.xml.ConfigurationParser;
import org.mybatis.generator.internal.DefaultShellCallback;

public class Create {

	public static void main(String[] args) throws Exception {
		generateMysql();
		extendMapper("plan.data.sql.mapper");
	}

	public static void extendMapper(String packageName) throws Exception {
		String path = System.getProperty("user.dir")+"\\src\\main\\java\\"+packageName.replace(".", "\\");
		List<File> files = FileUtil.getDirFiles(new File(path));
		for (File file : files) {
			if(file.getName().lastIndexOf("Mapper.java") != -1){
				
				String txt = FileUtil.readFile(file.toString(), "utf-8");
				if(txt.contains("extends"))
					continue;
				System.out.println(file.getName());
				String entity = txt.substring(txt.indexOf("public interface ") + 17, txt.indexOf("Mapper"));
				txt = txt.replace("{", "extends Mapper<"+entity+"> {");
				
				txt = txt.replace("public","import org.crap.data.dao.sql.service.Mapper;\n\npublic");
//				System.out.println(txt);
				
				FileUtil.writeFile(txt, file.toString(), "utf-8");
			}
		}
		
	}
	
	public static void generateMysql() throws Exception {
		List<String> warnings = new ArrayList<String>();
		boolean overwrite = true;
		ConfigurationParser cp = new ConfigurationParser(warnings);
		Configuration config = cp.parseConfiguration(Create.class.getClassLoader().getResourceAsStream("generatorConfig.xml"));
		DefaultShellCallback callback = new DefaultShellCallback(overwrite);
		MyBatisGenerator myBatisGenerator = new MyBatisGenerator(config, callback, warnings);
		myBatisGenerator.generate(null);
		warnings.forEach(System.out::println);
		System.out.println("----ok----");
	}
}
