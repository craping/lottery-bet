package plan.service.sync;

import io.netty.channel.Channel;
import io.netty.handler.codec.http.FullHttpRequest;

public class SyncSession {
	
	private FullHttpRequest request;
	
	private Channel response;
	
	private long time;

	private String token;
	
	public FullHttpRequest getRequest() {
		return request;
	}

	public void setRequest(FullHttpRequest request) {
		this.request = request;
	}

	public Channel getResponse() {
		return response;
	}

	public void setResponse(Channel response) {
		this.response = response;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}
	
	
}
