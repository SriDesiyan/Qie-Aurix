package discord.bot.domain.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 连接
 *
 * @author qiang
 * @date 2022/11/03
 */
@Component
@ServerEndpoint(value = "/websocket")
@Slf4j
public class DiscordWebsocket {

    /**
     * 保存所有在线socket连接
     */
    private static Map<String, DiscordWebsocket> webSocketMap = new LinkedHashMap<>();

    /**
     * 记录当前在线数目
     */
    private static int count = 0;

    /**
     * 当前连接
     */
    private Session session;

    /**
     * 处理连接建立
     *
     * @param session 会话
     */
    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        webSocketMap.put(session.getId(), this);
        addCount();
        log.info("新的连接加入：{}", session.getId());
    }

    /**
     * 接收消息
     *
     * @param message 消息
     * @param session 会话
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("收到客户端{}消息：{}", session.getId(), message);
        try {
            this.sendMessage("收到消息：" + message);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * 错误处理
     *
     * @param error   错误
     * @param session 会话
     */
    @OnError
    public void onError(Throwable error, Session session) {
        log.error("发生错误{}, {}", session.getId(), error);
    }

    /**
     * 连接关闭处理
     */
    @OnClose
    public void onClose() {
        webSocketMap.remove(this.session.getId());
        reduceCount();
        log.info("连接关闭:{}", this.session.getId());
    }

    /**
     * 发送消息
     *
     * @param message 消息
     * @throws IOException ioexception
     */
    private void sendMessage(String message) throws IOException {
        this.session.getBasicRemote().sendText(message);
    }

    /**
     * 广播
     */
    public static void broadcast(String message){
        DiscordWebsocket.webSocketMap.forEach((k, v)->{
            try{
                v.sendMessage(message);
            }catch (Exception e){
            }
        });
    }

    /**
     * 得到数
     *
     * @return int
     */
    public static int getCount() {
        return count;
    }

    /**
     * 减少数
     */
    private static synchronized void reduceCount() {
        DiscordWebsocket.count--;
    }

    /**
     * 添加计数
     */
    public static synchronized void addCount() {
        DiscordWebsocket.count++;
    }
}
