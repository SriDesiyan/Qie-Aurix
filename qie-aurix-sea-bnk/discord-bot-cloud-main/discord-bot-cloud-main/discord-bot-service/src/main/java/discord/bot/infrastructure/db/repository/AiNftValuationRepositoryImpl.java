package discord.bot.infrastructure.db.repository;

import cn.hutool.core.date.DateUtil;
import com.baomidou.dynamic.datasource.annotation.DS;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import discord.bot.infrastructure.db.entity.AiNftValuationDO;
import discord.bot.infrastructure.db.mapper.AiNftValuationMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

import java.util.Date;

/**
 * 非功能性测试元数据存储库impl
 *
 * @author qiang
 * @date 2022/11/28
 */
@DS("dev-clickhouse")
@Repository
public class AiNftValuationRepositoryImpl extends ServiceImpl<AiNftValuationMapper, AiNftValuationDO> {


    @Cacheable(cacheNames = "getAiValuation", key = "{#whiteListId, #id}")
    public AiNftValuationDO getAiValuation(Long whiteListId, Long id) {
        LambdaQueryWrapper<AiNftValuationDO> aiQueryWrapper = new LambdaQueryWrapper<>();
        aiQueryWrapper.select(AiNftValuationDO::getAiValuation)
                .eq(AiNftValuationDO::getWhiteListId, String.valueOf(whiteListId))
                .eq(AiNftValuationDO::getNftId, String.valueOf(id))
                .eq(AiNftValuationDO::getDataKey, DateUtil.formatDate(new Date()));
        return getOne(aiQueryWrapper);
    }
}
