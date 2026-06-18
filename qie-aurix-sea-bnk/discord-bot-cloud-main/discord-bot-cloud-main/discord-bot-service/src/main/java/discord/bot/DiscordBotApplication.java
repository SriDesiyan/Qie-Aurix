package discord.bot;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("")
public class DiscordBotApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscordBotApplication.class, args);
    }
}