package discord.bot.infrastructure.db.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import discord.bot.infrastructure.db.entity.DiscordChannelDO;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 不和通道映射器
 *
 * @author qiang
 * @date 2022/11/28
 */
public interface DiscordChannelMapper extends BaseMapper<DiscordChannelDO> {
    @Select("SELECT\n" +
            "b.collection_symbol\n" +
            "FROM\n" +
            "discord_channel a\n" +
            "LEFT JOIN nft_collection_white_list b ON a.contract_address = b.contract_address\n" +
            "WHERE\n" +
            "a.channel_id = ${channelId}")
    List<String> config(String channelId);
}
