package discord.bot.infrastructure.db.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.NftCollectionWhiteListDO;
import discord.bot.infrastructure.db.mapper.NftCollectionWhiteListMapper;
import discord.bot.interfaces.query.dto.ListenerDTO;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * NFT白名单信息表 数据持久层服务实现类
 *
 * @author create by mybatisplus generator
 * @since 2021-10-29
 */
@Repository
public class NftCollectionWhiteListRepositoryImpl extends ServiceImpl<NftCollectionWhiteListMapper,
        NftCollectionWhiteListDO> {


    @Cacheable(cacheNames = "selectList")
    public List<NftCollectionWhiteListDO> selectList() {
        LambdaQueryWrapper<NftCollectionWhiteListDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(NftCollectionWhiteListDO::getNftName,
                        NftCollectionWhiteListDO::getSlugSymbol,
                        NftCollectionWhiteListDO::getExternalUrl,
                        NftCollectionWhiteListDO::getId,
                        NftCollectionWhiteListDO::getContractAddress)
                .eq(NftCollectionWhiteListDO::getIsSupportedAnalysis, 1);
        return list(queryWrapper);
    }

    @Cacheable(cacheNames = "collectionListener")
    public List<ListenerDTO> collectionListener() {
        return baseMapper.collectionListener();
    }
}
