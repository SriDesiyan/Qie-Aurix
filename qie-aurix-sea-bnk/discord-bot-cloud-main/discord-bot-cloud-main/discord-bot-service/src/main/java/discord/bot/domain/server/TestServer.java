package discord.bot.domain.server;

import discord.bot.domain.websocket.DiscordWebsocket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
@Slf4j
public class TestServer {
    private static int count = 0;
//    @Scheduled(cron = "0/1 * * * * ?")
    public void send() {
        count++;
        log.info("发送count: {}", count);
        if (DiscordWebsocket.getCount() > 0) {
            DiscordWebsocket.broadcast("ceshi" + DiscordWebsocket.getCount());
        }
    }
}
