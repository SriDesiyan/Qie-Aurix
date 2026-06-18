package discord.bot.interfaces.query.dto;

import lombok.Data;

import java.io.Serializable;

@Data
public class ListenerDTO implements Serializable {
    public String openseaSymbol;

    public String imageUrl;

    private String channelId;
}
