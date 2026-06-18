package discord.bot.infrastructure.db.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import discord.bot.infrastructure.db.entity.EthereumFloorPriceHistoryDO;
import discord.bot.interfaces.query.dto.CollectionDTO;
import org.apache.ibatis.annotations.Select;

/**
 * ethereum底价历史映射器
 *
 * @author qiang
 * @date 2022/11/29
 */
public interface EthereumFloorPriceHistoryMapper extends BaseMapper<EthereumFloorPriceHistoryDO> {

    /**
     * 集合
     *
     * @param contractAddress 合同地址
     * @return {@link CollectionDTO}
     */
    @Select("SELECT " +
            "a.slug_symbol collection_symbol, floor_price, b.image_url image_url, announce_number nft_number " +
            "FROM " +
            "ethereum_floor_price_history a " +
            "LEFT JOIN nft_collection_white_list b ON a.contract_address=b.contract_address " +
            "WHERE a.contract_address = #{contractAddress} " +
            "ORDER BY floor_timestamp DESC " +
            "LIMIT 1")
    CollectionDTO collection(String contractAddress);
}
