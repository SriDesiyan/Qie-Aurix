package discord.bot.interfaces.query.impl;

import discord.bot.infrastructure.db.repository.NftCollectionValuationRepositoryImpl;
import discord.bot.interfaces.query.dto.NftCollectionValuationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ValuationImpl {

    private final NftCollectionValuationRepositoryImpl nftCollectionValuationService;

    public NftCollectionValuationDTO valuation(String symbol) {
        return nftCollectionValuationService.valuation(symbol);
    }
}
