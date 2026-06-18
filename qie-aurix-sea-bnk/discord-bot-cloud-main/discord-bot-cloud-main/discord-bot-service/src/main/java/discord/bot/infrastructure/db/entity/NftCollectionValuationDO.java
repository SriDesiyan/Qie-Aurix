package discord.bot.infrastructure.db.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * 
 * @TableName nft_collection_valuation
 */
@Data
@EqualsAndHashCode
public class NftCollectionValuationDO implements Serializable {
    /**
     * id
     */
    private Long id;

    /**
     * 系列标识
     */
    private String slugSymbol;

    /**
     * 系列估价
     */
    private BigDecimal valuation;

    /**
     * 平台类型
     */
    private String platformType;

    /**
     * 记录创建时间
     */
    private Date createTime;

    /**
     * 记录更新时间
     */
    private Date updateTime;

    private static final long serialVersionUID = 1L;

}