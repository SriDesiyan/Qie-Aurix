package discord.bot.infrastructure.db.repository;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.NftCollectionValuationDO;
import discord.bot.infrastructure.db.mapper.NftCollectionValuationMapper;
import discord.bot.interfaces.query.dto.NftCollectionValuationDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

/**
 * @author qiang
 * @description 针对表【nft_collection_valuation】的数据库操作Service实现
 * @createDate 2022-11-02 16:03:17
 */
@Repository
public class NftCollectionValuationRepositoryImpl extends ServiceImpl<NftCollectionValuationMapper, NftCollectionValuationDO> {

    @Cacheable(cacheNames = "collectionListener", key = "{#symbol}")
    public NftCollectionValuationDTO valuation(String symbol) {
        return baseMapper.valuation(symbol);
    }
}
