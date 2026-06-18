package discord.bot.infrastructure.db.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import discord.bot.infrastructure.db.entity.NftCollectionWhiteListDO;
import discord.bot.interfaces.query.dto.ListenerDTO;
import discord.bot.interfaces.query.dto.NftCollectionWhiteListDTO;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * NFT白名单信息表 Mapper 接口
 *
 * @author create by mybatisplus generator
 * @since 2021-10-29
 */
public interface NftCollectionWhiteListMapper extends BaseMapper<NftCollectionWhiteListDO> {
    @Select("SELECT  " +
            "opensea_symbol, image_url, channel_id  " +
            "FROM  " +
            "discord_channel a  " +
            "LEFT JOIN (SELECT contract_address, opensea_symbol, image_url FROM nft_collection_white_list) b ON a.contract_address = b.contract_address ")
    List<ListenerDTO> collectionListener();
}
