package discord.bot.interfaces.query.dto;

import lombok.Data;

import java.io.Serializable;
import java.util.Date;

@Data
public class NftCollectionValuationDTO implements Serializable {
    private String symbol;

    private String url;

    private Double floorPrice;

    private Double valuation;

    private Date valuationDate;
}
