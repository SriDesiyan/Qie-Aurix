package discord.bot.infrastructure.db.repository;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.EthereumFloorPriceHistoryDO;
import discord.bot.infrastructure.db.mapper.EthereumFloorPriceHistoryMapper;
import discord.bot.interfaces.query.dto.CollectionDTO;
import org.springframework.stereotype.Repository;

/**
 * impl ethereum底价历史库
 *
 * @author qiang
 * @date 2022/11/29
 */
@Repository
public class EthereumFloorPriceHistoryRepositoryImpl extends ServiceImpl<EthereumFloorPriceHistoryMapper, EthereumFloorPriceHistoryDO> {
    public CollectionDTO collection(String contractAddress) {
        return baseMapper.collection(contractAddress);
    }
}
