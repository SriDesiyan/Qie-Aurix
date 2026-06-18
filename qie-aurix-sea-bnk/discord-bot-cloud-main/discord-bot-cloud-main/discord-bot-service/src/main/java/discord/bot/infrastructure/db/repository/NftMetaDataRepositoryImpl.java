package discord.bot.infrastructure.db.repository;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.NftMetaDataDO;
import discord.bot.infrastructure.db.mapper.NftMetaDataMapper;
import org.springframework.stereotype.Repository;

/**
 * 非功能性测试元数据存储库impl
 *
 * @author qiang
 * @date 2022/11/28
 */
@Repository
public class NftMetaDataRepositoryImpl extends ServiceImpl<NftMetaDataMapper, NftMetaDataDO> {
}
