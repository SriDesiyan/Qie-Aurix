package discord.bot.infrastructure.db.repository;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.DiscordChannelDO;
import discord.bot.infrastructure.db.mapper.DiscordChannelMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 不和通道库impl
 *
 * @author qiang
 * @date 2022/11/28
 */
@Repository
public class DiscordChannelRepositoryImpl extends ServiceImpl<DiscordChannelMapper, DiscordChannelDO> {

    public List<String> config(String channelId) {
        return baseMapper.config(channelId);
    }
}
