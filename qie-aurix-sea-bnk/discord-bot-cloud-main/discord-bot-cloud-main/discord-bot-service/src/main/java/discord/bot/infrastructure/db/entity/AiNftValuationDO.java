package discord.bot.infrastructure.db.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 人工智能非功能性测试评估
 *
 * @author qiang
 * @TableName ai_nft_valuation
 * @date 2022/11/28
 */
@Data
@TableName("ai_nft_valuation")
public class AiNftValuationDO implements Serializable {
    /**
     * 
     */
    private Date dataKey;

    /**
     * 
     */
    private Date valuationDate;

    /**
     * 
     */
    private Object whiteListId;

    /**
     * 
     */
    private Object nftId;

    /**
     * 
     */
    private Object tokenAddress;

    /**
     * 
     */
    private Double simpleValuation;

    /**
     * 
     */
    private Double aiValuation;

    /**
     * 
     */
    private Object priceType;

    /**
     * 
     */
    private Date updateTime;

    private static final long serialVersionUID = 1L;

}