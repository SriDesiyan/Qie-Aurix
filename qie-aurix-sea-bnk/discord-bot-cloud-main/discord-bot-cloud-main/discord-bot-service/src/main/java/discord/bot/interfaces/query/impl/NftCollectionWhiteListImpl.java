package discord.bot.interfaces.query.impl;

import discord.bot.infrastructure.db.entity.NftCollectionWhiteListDO;
import discord.bot.infrastructure.db.repository.NftCollectionWhiteListRepositoryImpl;
import discord.bot.interfaces.query.assembler.NftCollectionWhiteListDTOAssembler;
import discord.bot.interfaces.query.dto.ListenerDTO;
import discord.bot.interfaces.query.dto.NftCollectionWhiteListDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 非功能性测试白名单impl集合
 *
 * @author qiang
 * @date 2022/11/29
 */
@Service
@Slf4j
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class NftCollectionWhiteListImpl {
    private final NftCollectionWhiteListRepositoryImpl nftCollectionWhiteListRepository;
    private final NftCollectionWhiteListDTOAssembler converter;

    public List<NftCollectionWhiteListDTO> whitelist() {
        List<NftCollectionWhiteListDO> nftCollectionWhiteListDos = nftCollectionWhiteListRepository.selectList();
        return nftCollectionWhiteListDos.stream()
                .map(converter::apply)
                .sorted((o1, o2) -> o1.getName().compareToIgnoreCase(o2.getName()))
                .collect(Collectors.toList());
    }

    public List<ListenerDTO> collectionListener() {
        return nftCollectionWhiteListRepository.collectionListener();
    }
}
