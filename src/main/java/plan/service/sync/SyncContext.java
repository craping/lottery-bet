package plan.service.sync;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedTransferQueue;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpResponse;
import io.netty.handler.codec.http.HttpHeaderNames;
import io.netty.handler.codec.http.HttpHeaderValues;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.util.CharsetUtil;
import plan.data.redis.RedisUtil;
import plan.service.sync.pojo.SyncAction;
import plan.service.sync.pojo.SyncMsg;

@Component
@EnableScheduling
public class SyncContext implements SchedulingConfigurer {
    
	public static final LinkedTransferQueue<SyncSession> CONTEXT = new LinkedTransferQueue<>();
	
//	public static final Map<String, TransferQueue<SyncMsg>> MSGS = new ConcurrentHashMap<>();
	
	protected static ObjectMapper MAPPER = new ObjectMapper();
	
	static{
		MAPPER.setSerializationInclusion(JsonInclude.Include.NON_NULL);
		MAPPER.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
		MAPPER.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		MAPPER.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
	}
	
	public SyncContext() {
	}
	
	  
	  
	/**  
	* @Title: putGlobalMsg  
	* @Description: 全局消息通知队列
	* @param @param msg    参数  
	* @return void    返回类型  
	* @throws  
	*/  
	    
	public static void putGlobalMsg(SyncMsg msg){
		Set<String> tokens = RedisUtil.keys("user_*");
		tokens.forEach(key -> {
			try {
				RedisUtil.rpush("queue_"+key.split("_")[1], MAPPER.writeValueAsString(msg));
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}
		});
	}
	  
	/**  
	* @Title: toMsg  
	* @Description: 发送给指定token会话
	* @param @param token
	* @param @param msg    参数  
	* @return void    返回类型  
	* @throws  
	*/  
	    
	public static void toMsg(String token, SyncMsg msg){
		try {
			RedisUtil.rpush("queue_"+token, MAPPER.writeValueAsString(msg));
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
	}
	
	public static void toMsg(Collection<String> tokens, SyncMsg msg){
		tokens.forEach(token -> {
			toMsg(token, msg);
		});
	}
	
	public static void toMsgs(Map<String, SyncMsg> map){
		map.forEach((token, msg) -> {
			toMsg(token, msg);
		});
	}
	
	@Scheduled(fixedDelay=1000)
    private void run() {
//			System.out.println("当前连接数："+CONTEXT.size());
		long currentTime;
		SyncSession session;
		String queue;
		String json;
		List<SyncMsg> msgs;
		List<String> list;
		
		while ((session = CONTEXT.poll()) != null) {
			queue = "queue_"+session.getToken();
			currentTime = System.currentTimeMillis();
			
			list = RedisUtil.lrange(queue, 0, 50);
			if(list.size() > 0){
				RedisUtil.ltrim(queue, list.size(), -1);
				 msgs = list.stream().map(s -> {
					try {
						return MAPPER.readValue(s, SyncMsg.class);
					} catch (IOException e) {
						e.printStackTrace();
					}
					return new SyncMsg(null);
				}).collect(Collectors.toList());
				
				json = "[]";
				try {
					json = MAPPER.writeValueAsString(msgs);
				} catch (JsonProcessingException e) {
					e.printStackTrace();
				}
				writeResponse(session, json);
			} else if(currentTime - session.getTime() > 30000){
				writeResponse(session, "[]");
			} else {
				CONTEXT.put(session);
			}
		}
	}
	
	@Override
	public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
		taskRegistrar.setScheduler(taskExecutor());
	}
	
	@Bean(destroyMethod="shutdown")
	private Executor taskExecutor() {
        return Executors.newScheduledThreadPool(1);
    }
	
	protected static void writeResponse(SyncSession session, String msg){
		
		if(session != null) {
			ByteBuf byteBuf = Unpooled.copiedBuffer(msg == null?"":msg, CharsetUtil.UTF_8);
			FullHttpResponse response = new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.OK, byteBuf);
			response.headers().add(HttpHeaderNames.CONTENT_TYPE, NettySyncRender.DEFAULT_CONTENT_TYPE);
			response.headers().add(HttpHeaderNames.CONTENT_LENGTH, String.valueOf(byteBuf.readableBytes()));
			
			boolean close = (session.getRequest().headers().contains(HttpHeaderNames.CONNECTION, HttpHeaderValues.CLOSE, true)
					|| session.getRequest().protocolVersion().equals(HttpVersion.HTTP_1_0)
					&& !session.getRequest().headers().contains(HttpHeaderNames.CONNECTION, HttpHeaderValues.KEEP_ALIVE, true));
			
			if(!close){
				response.headers().add(HttpHeaderNames.CONTENT_LENGTH, String.valueOf(response.content().readableBytes()));
			}
			
			ChannelFuture future = session.getResponse().writeAndFlush(response);
			future.addListener(ChannelFutureListener.CLOSE);
		}
	}

	public static void main(String[] args) throws Exception {
		SyncMsg msg = new SyncMsg(SyncAction.LOTTERY.BET);
		Map<String, Object> data = new HashMap<>();
		msg.setData(1);
		System.out.println();
		MAPPER.readValue(MAPPER.writeValueAsString(msg), SyncMsg.class);
		
	}
}
