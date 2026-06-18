package discord.bot.application.controller;

import com.gecko.cloud.kit.rest.ResponseData;
import discord.bot.infrastructure.db.entity.DiscordChannelDO;
import discord.bot.interfaces.query.command.cmd.CollectionNftCommand;
import discord.bot.interfaces.query.dto.CollectionDTO;
import discord.bot.interfaces.query.dto.CollectionNftDTO;
import discord.bot.interfaces.query.impl.DiscordImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Discord-bot控制器
 *
 * @author qiang
 * @date 2022/11/28
 */
@RestController
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
@RequestMapping("discord")
public class DiscordController {
    private final DiscordImpl discord;

    /**
     * 配置
     *
     * @param channelId 通道标识
     * @return {@link ResponseData}<{@link List}<{@link String}>>
     */
    @GetMapping("/config/{channelId}")
    public ResponseData<List<String>> config(@PathVariable String channelId) {
        return ResponseData.success(discord.config(channelId));
    }

    /**
     * 绑定频道
     *
     * @param discordChannelDO 不和频道做
     * @return {@link ResponseData}<{@link Boolean}>
     */
    @PostMapping("/bind")
    public ResponseData<Boolean> bind(@RequestBody DiscordChannelDO discordChannelDO) {
        return ResponseData.success(discord.bind(discordChannelDO));
    }

    /**
     * 解绑频道
     *
     * @param discordChannelDO 不和频道做
     * @return {@link ResponseData}<{@link Boolean}>
     */
    @PostMapping("/unbind")
    public ResponseData<Boolean> unbind(@RequestBody DiscordChannelDO discordChannelDO) {
        return ResponseData.success(discord.unbind(discordChannelDO));
    }

    /**
     * 通过系列和tokenId 获取nft信息
     *
     * @param collectionNftCommand 收集非功能性测试命令
     * @return {@link ResponseData}<{@link CollectionNftDTO}>
     */
    @PostMapping("nftInfo")
    public ResponseData<CollectionNftDTO> nftInfo(@RequestBody CollectionNftCommand collectionNftCommand) {
        return ResponseData.success(discord.nftInfo(collectionNftCommand));
    }

    /**
     * 通过地址查询系列信息
     *
     * @param contractAddress 合同地址
     * @return {@link ResponseData}<{@link CollectionDTO}>
     */
    @GetMapping("/collection/{contractAddress}")
    public ResponseData<CollectionDTO> collection(@PathVariable String contractAddress) {
        return ResponseData.success(discord.collection(contractAddress));
    }
}
