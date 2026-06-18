package discord.bot.interfaces.query.dto;

import lombok.Data;

/**
 * 收集dto
 *
 * @author qiang
 * @date 2022/11/29
 */
@Data
public class CollectionDTO {
    private String collectionSymbol;

    private String floorPrice;

    private String imageUrl;

    private String nftNumber;
}
