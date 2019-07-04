package plan.service.sync;

import org.crap.jrain.core.bean.result.Errcode;
import org.crap.jrain.core.bean.result.criteria.DataResult;
import org.crap.jrain.core.error.support.Errors;
import org.crap.jrain.mvc.netty.render.NettyJSONRender;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;

public class NettySyncRender extends NettyJSONRender {
	
	public static final String DEFAULT_FORMAT = "sync";
	
	public NettySyncRender() {
		setContentType(DEFAULT_CONTENT_TYPE);
		setFormat(DEFAULT_FORMAT);
	}
	
	@Override
	public void render(Errcode errcode, FullHttpRequest request, Channel channel) {
		if(!errcode.equal(Errors.OK)){
			super.render(errcode, request, channel);
			return;
		}
		String token = ((DataResult) errcode).getData().getInfo().toString();
		SyncSession session = new SyncSession();
		session.setRequest(request);
		session.setResponse(channel);
		session.setToken(token);
		session.setTime(System.currentTimeMillis());
		SyncContext.CONTEXT.put(session);
		
//		SyncEvent event = new SyncEvent();
//		event.setRequest(request);
//		event.setResponse(channel);
//		event.setToken(token);
//		event.setTime(System.currentTimeMillis());
//		SyncContext.publishEvent(event);
//		SyncContext.MSGS.putIfAbsent(token, new LinkedTransferQueue<>());
	}
}
