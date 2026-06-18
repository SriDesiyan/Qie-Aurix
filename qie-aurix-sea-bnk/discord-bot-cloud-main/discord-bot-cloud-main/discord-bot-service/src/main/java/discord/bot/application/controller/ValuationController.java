package discord.bot.application.controller;

import com.gecko.cloud.kit.rest.ResponseData;
import discord.bot.interfaces.query.dto.NftCollectionValuationDTO;
import discord.bot.interfaces.query.impl.ValuationImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 估值控制器
 *
 * @author qiang
 * @date 2022/11/28
 */
@RestController
@RequestMapping("valuation")
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class ValuationController {
    private final ValuationImpl valuationService;

    /**
     * 通过symbol进行估值
     *
     * @param symbol 象征
     * @return {@link ResponseData}<{@link NftCollectionValuationDTO}>
     */
    @GetMapping("/{symbol}")
    public ResponseData<NftCollectionValuationDTO> valuation(@PathVariable("symbol") String symbol) {
        return ResponseData.success(valuationService.valuation(symbol));
    }
}
