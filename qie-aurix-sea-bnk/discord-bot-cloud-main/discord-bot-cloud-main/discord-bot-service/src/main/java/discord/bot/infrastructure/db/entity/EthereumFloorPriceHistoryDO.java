package discord.bot.infrastructure.db.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

/**
 * ethereum底价历史
 * 地板价历史表
 *
 * @author qiang
 * @TableName ethereum_floor_price_history
 * @date 2022/11/29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
@TableName("ethereum_floor_price_history")
public class EthereumFloorPriceHistoryDO implements Serializable {
    /**
     * id
     */
    private Long id;

    /**
     * 系列标识
     */
    private String slugSymbol;

    /**
     * NFT合约地址
     */
    private String contractAddress;

    /**
     * OpenSea地板价
     */
    private BigDecimal openseaFloorPrice;

    /**
     * LooksRare地板价
     */
    private BigDecimal looksrareFloorPrice;

    /**
     * X2Y2地板价
     */
    private BigDecimal xyFloorPrice;

    /**
     * 地板价
     */
    private BigDecimal floorPrice;

    /**
     * 记录创建时间
     */
    private Date createTime;

    /**
     * 记录更新时间
     */
    private Date updateTime;

    /**
     * 地板价时间戳
     */
    private Long floorTimestamp;

    private static final long serialVersionUID = 1L;

}