package discord.bot.application.controller;

import com.gecko.cloud.kit.rest.ResponseData;
import discord.bot.interfaces.query.dto.ListenerDTO;
import discord.bot.interfaces.query.dto.NftCollectionWhiteListDTO;
import discord.bot.interfaces.query.impl.NftCollectionWhiteListImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 非功能性测试白名单控制器集合
 *
 * @author qiang
 * @date 2022/11/28
 */
@RestController
@RequestMapping("collection")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NftCollectionWhiteListController {

    private final NftCollectionWhiteListImpl nftCollectionWhiteList;

    /**
     * 白名单列表
     *
     * @return {@link ResponseData}<{@link List}<{@link NftCollectionWhiteListDTO}>>
     */
    @GetMapping("/whitelist")
    public ResponseData<List<NftCollectionWhiteListDTO>> whitelist() {
        return ResponseData.success(nftCollectionWhiteList.whitelist());
    }

    /**
     * 系列监听
     *
     * @return {@link ResponseData}<{@link List}<{@link ListenerDTO}>>
     */
    @GetMapping("/collectionListener")
    public ResponseData<List<ListenerDTO>> collectionListener() {
        return ResponseData.success(nftCollectionWhiteList.collectionListener());
    }

}
