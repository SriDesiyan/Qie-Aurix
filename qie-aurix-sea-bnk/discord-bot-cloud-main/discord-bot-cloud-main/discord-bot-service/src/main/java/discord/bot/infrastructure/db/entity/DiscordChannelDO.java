package discord.bot.infrastructure.db.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 频道
 *
 * @author qiang
 * @date 2022/11/28
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("discord_channel")
public class DiscordChannelDO implements Serializable {

    /**
     * 白名单id
     */
    private String contractAddress;

    /**
     * 频道ID
     */
    private String channelId;
}
