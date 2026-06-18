package discord.bot.infrastructure.db.entity;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

/**
 * NFT元数据信息表
 *
 * @author create by banksea
 * @since 2021-12-29
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("nft_meta_data")
public class NftMetaDataDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    private Long id;

    /**
     * NFT白名单id
     */
    private Long whiteListId;

    /**
     * 公链来源
     */
    private String chainSource;

    /**
     * 合约地址
     */
    private String contractAddress;

    /**
     * token id
     */
    private String tokenId;

    /**
     * 系列标识
     */
    private String slugSymbol;

    /**
     * NFT系列名称
     */
    private String nftName;

    /**
     * NFT标识主键, Ethereum赋值"合约地址:tokenId", sol "tokenAddress"
     */
    private String tokenAddress;

    /**
     * 元数据外部链接
     */
    private String tokenMetadataUrl;

    /**
     * NFT名称
     */
    private String nftTokenName;

    /**
     * 图片链接
     */
    private String imageUrl;

    /**
     * 描述
     */
    private String nftDescription;

    /**
     * 外部链接
     */
    private String externalUrl;

    /**
     * 版本
     */
    private String editionClass;

    /**
     * 属性数组
     */
    private String attributes;

    /**
     * 属性数组
     */
    private String attributesRarity;

    /**
     * 稀有度排名
     */
    private Long rank;

    /**
     * 稀有度
     */
    private String rarityScore;

    private Double rarity;

    /**
     * 记录创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 记录更新时间
     */
    @TableField(fill = FieldFill.UPDATE)
    private Date updateTime;
}
