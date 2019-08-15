package plan;

import org.crap.jrain.core.launch.Boot;
import org.crap.jrain.mvc.netty.NettyTreatment;
import org.crap.jrain.mvc.netty.ServerDispatcher;
import org.crap.jrain.mvc.netty.render.NettyJSONRender;
import org.crap.jrain.mvc.netty.render.NettyXMLRender;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpContentCompressor;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.SelfSignedCertificate;
import io.netty.handler.stream.ChunkedWriteHandler;
import plan.service.sync.NettySyncRender;

public class HttpServer {

	static final boolean SSL = System.getProperty("ssl") != null;
	public static final int PORT = Integer.parseInt(System.getProperty("port", SSL? "8443" : "89"));
	/** 用于分配处理业务线程的线程组个数 */
	protected static final int BIZGROUPSIZE = Runtime.getRuntime().availableProcessors() * 2; // 默认
	/** 业务出现线程大小 */
	protected static final int BIZTHREADSIZE = 4;

	private static final EventLoopGroup bossGroup = new NioEventLoopGroup(BIZGROUPSIZE);

	private static final EventLoopGroup workerGroup = new NioEventLoopGroup(BIZTHREADSIZE);

	public static void start(Boot boot) throws Exception {
		
		final NettyTreatment treatment = new NettyTreatment(boot);
		treatment.addRender(new NettyJSONRender());
		treatment.addRender(new NettyXMLRender());
		treatment.addRender(new NettySyncRender());
		// Configure SSL.
		final SslContextBuilder sslCtx;
		if (SSL) {
			SelfSignedCertificate ssc = new SelfSignedCertificate();
			sslCtx = SslContextBuilder.forServer(ssc.privateKey(), ssc.certificate());
		} else {
			sslCtx = null;
		}
		try {
			ServerBootstrap b = new ServerBootstrap();
			b.option(ChannelOption.SO_BACKLOG, 1024);
			b.group(bossGroup, workerGroup)
			.channel(NioServerSocketChannel.class)
			.handler(new LoggingHandler(LogLevel.INFO))
			.childHandler(new ChannelInitializer<SocketChannel>() {
			@Override
			public void initChannel(SocketChannel ch) throws Exception {
					ChannelPipeline pipeline = ch.pipeline();
					if (sslCtx != null) {
						pipeline.addLast(sslCtx.build().newHandler(ch.alloc()));
					}
					pipeline
					.addLast(new HttpServerCodec())
					/**
					 * usually we receive http message
					 * infragment,if we want full http message,
					 * we should bundle HttpObjectAggregator and
					 * we can get FullHttpRequest。
					 * 我们通常接收到的是一个http片段，如果要想完整接受一次请求的所有数据，
					 * 我们需要绑定HttpObjectAggregator，然后我们
					 * 就可以收到一个FullHttpRequest-是一个完整的请求信息。
					 **/
					.addLast(new HttpObjectAggregator(1024*1024*64))// 定义缓冲数据量
					.addLast(new ChunkedWriteHandler())
					.addLast(new HttpContentCompressor())
					.addLast(new ServerDispatcher(treatment));
				}
			});
			Channel ch = b.bind(PORT).sync().channel();

			System.err.println("Open your web browser and navigate to " + (SSL ? "https" : "http") + "://127.0.0.1:" + PORT + '/');

			ch.closeFuture().sync();
		} finally {
			bossGroup.shutdownGracefully();
			workerGroup.shutdownGracefully();
		}
	}
}