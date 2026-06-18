package discord.bot.infrastructure.db.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import discord.bot.infrastructure.db.entity.NftCollectionValuationDO;
import discord.bot.interfaces.query.dto.NftCollectionValuationDTO;
import org.apache.ibatis.annotations.Select;

/**
* @author qiang
* @description 针对表【nft_collection_valuation】的数据库操作Mapper
* @createDate 2022-11-02 16:03:17
* @Entity discord.bot.infrastructure.db.entity.NftCollectionValuation
*/
public interface NftCollectionValuationMapper extends BaseMapper<NftCollectionValuationDO> {


    @Select("SELECT  " +
            " a.slug_symbol as symbol,  " +
//            " b.magiceden_floor_price as floor_price,  " +
            " a.external_url as url,  " +
            " c.valuation as valuation,  " +
            " c.update_time as valuation_date " +
            "FROM  " +
            " nft_collection_white_list a  " +
//            " LEFT JOIN nft_collection_floor_price b ON a.id = b.id  " +
            " LEFT JOIN nft_collection_valuation c ON a.id = c.id  " +
            "WHERE  " +
            " a.slug_symbol = #{symbol} OR a.opensea_symbol = #{symbol}")
    NftCollectionValuationDTO valuation(String symbol);
}
