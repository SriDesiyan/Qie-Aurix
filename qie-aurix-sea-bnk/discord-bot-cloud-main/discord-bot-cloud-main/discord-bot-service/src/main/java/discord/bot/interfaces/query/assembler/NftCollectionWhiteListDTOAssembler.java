package discord.bot.interfaces.query.assembler;

import discord.bot.infrastructure.db.entity.NftCollectionWhiteListDO;
import discord.bot.interfaces.query.dto.NftCollectionWhiteListDTO;
import org.springframework.stereotype.Component;

@Component
public class NftCollectionWhiteListDTOAssembler {
    public NftCollectionWhiteListDTO apply(NftCollectionWhiteListDO t) {
        NftCollectionWhiteListDTO target = new NftCollectionWhiteListDTO();
        target.setName(t.getNftName());
        target.setSymbol(t.getContractAddress());
        return target;
    }

}
