package discord.bot.interfaces.query.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * 收集非功能性测试dto
 *
 * @author qiang
 * @date 2022/11/28
 */
@Data
public class CollectionNftDTO implements Serializable {
    private String imageUrl;

    private String attributesRarity;

    private Long rank;

    private String rarityScore;

    private String nftTokenName;

    private Double aiValuation;
}
