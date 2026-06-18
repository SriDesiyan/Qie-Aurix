package discord.bot.interfaces.query.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import discord.bot.application.exception.BusinessException;
import discord.bot.infrastructure.db.entity.AiNftValuationDO;
import discord.bot.infrastructure.db.entity.DiscordChannelDO;
import discord.bot.infrastructure.db.entity.NftMetaDataDO;
import discord.bot.infrastructure.db.repository.AiNftValuationRepositoryImpl;
import discord.bot.infrastructure.db.repository.DiscordChannelRepositoryImpl;
import discord.bot.infrastructure.db.repository.EthereumFloorPriceHistoryRepositoryImpl;
import discord.bot.infrastructure.db.repository.NftMetaDataRepositoryImpl;
import discord.bot.interfaces.query.command.cmd.CollectionNftCommand;
import discord.bot.interfaces.query.dto.CollectionDTO;
import discord.bot.interfaces.query.dto.CollectionNftDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

/**
 * Discord-bot 实现类
 *
 * @author qiang
 * @date 2022/11/28
 */
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class DiscordImpl {
    private final DiscordChannelRepositoryImpl discordChannelRepository;

    private final NftMetaDataRepositoryImpl nftMetaDataRepository;

    private final AiNftValuationRepositoryImpl aiNftValuationRepository;

    private final EthereumFloorPriceHistoryRepositoryImpl ethereumFloorPriceHistoryRepository;

    public List<String> config(String channelId) {
        return discordChannelRepository.config(channelId);
    }

    /**
     * 绑定频道通知
     *
     * @param discordChannelDO 存储频道ID和白名单ID
     * @return {@link Boolean}
     */
    public Boolean bind(DiscordChannelDO discordChannelDO) {
        LambdaQueryWrapper<DiscordChannelDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DiscordChannelDO::getChannelId, discordChannelDO.getChannelId())
                .eq(DiscordChannelDO::getContractAddress, discordChannelDO.getContractAddress());
        DiscordChannelDO one = discordChannelRepository.getOne(queryWrapper);
        if (!Objects.isNull(one)) {
            throw new BusinessException("401", "The series has been bound and cannot be bound repeatedly.");
        }
        return discordChannelRepository.save(discordChannelDO);
    }

    /**
     * 取消绑定频道通知
     *
     * @param discordChannelDO 存储频道ID和白名单ID
     * @return {@link Boolean}
     */
    public Boolean unbind(DiscordChannelDO discordChannelDO) {
        LambdaQueryWrapper<DiscordChannelDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DiscordChannelDO::getChannelId, discordChannelDO.getChannelId())
                .eq(DiscordChannelDO::getContractAddress, discordChannelDO.getContractAddress());
        return discordChannelRepository.remove(queryWrapper);
    }

    public CollectionNftDTO nftInfo(CollectionNftCommand collectionNftCommand) {
        // 获取单个NFT信息
        LambdaQueryWrapper<NftMetaDataDO> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(NftMetaDataDO::getImageUrl, NftMetaDataDO::getAttributesRarity, NftMetaDataDO::getRank, NftMetaDataDO::getRarityScore, NftMetaDataDO::getId, NftMetaDataDO::getNftTokenName, NftMetaDataDO::getWhiteListId)
                .eq(NftMetaDataDO::getContractAddress, collectionNftCommand.getContractAddress())
                .eq(NftMetaDataDO::getTokenId, collectionNftCommand.getTokenId());
        NftMetaDataDO nftMetaDataDO = nftMetaDataRepository.getOne(queryWrapper);
        if (nftMetaDataDO == null) {
            return null;
        }
        // 获取AI估价数据
        AiNftValuationDO aiNftValuationDO = aiNftValuationRepository.getAiValuation(nftMetaDataDO.getWhiteListId(), nftMetaDataDO.getId());
        // 组合
        CollectionNftDTO collectionNftDTO = new CollectionNftDTO();
        BeanUtils.copyProperties(nftMetaDataDO, collectionNftDTO);
        collectionNftDTO.setAiValuation(aiNftValuationDO.getAiValuation());
        return collectionNftDTO;
    }

    public CollectionDTO collection(String contractAddress) {
        return ethereumFloorPriceHistoryRepository.collection(contractAddress);
    }
}
