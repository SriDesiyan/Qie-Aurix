package discord.bot.infrastructure.db.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.io.Serializable;
import java.util.Date;

/**
 * NFT系列白名单信息表
 *
 * @author create by mybatisplus generator
 * @since 2021-11-18
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true)
@TableName("nft_collection_white_list")
public class NftCollectionWhiteListDO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @TableId(value = "id", type = IdType.INPUT)
    private Long id;

    /**
     * NFT合约地址, 来源自Ethereum, 用来直接创建爬取任务
     */
    private String contractAddress;

    /**
     * 图片URL
     */
    private String imageUrl;

    /**
     * 横幅url
     */
    private String bannerImageUrl;

    /**
     * 描述
     */
    private String description;

    private String openseaSymbol;

    /**
     * 链接
     */
    private String externalUrl;

    /**
     * discord url
     */
    private String discordUrl;

    /**
     * nft版本
     */
    private String nftVersion;

    /**
     * nft模型
     */
    private String schemaName;

    /**
     * nft总供给量
     */
    private String totalSupply;

    /**
     * NFT创造者公钥, 来源自Solana, 用来获取所有token列表, 然后创建爬取任务
     */
    private String updateAuthority;

    /**
     * 公链来源, 例如"Ethereum""Solana"
     */
    private String chainSource;

    /**
     * NFT系列标识, 系列的主键
     */
    private String slugSymbol;

    /**
     * 基准代币
     */
    private String priceType;

    /**
     * 代币精度
     */
    private Long demical;

    /**
     * 单次喂价最少喂价节点数
     */
    private Long minFeedCount;

    /**
     * 单次喂价最大时间偏离(s)
     */
    private Long maxFeedTimeOffset;

    /**
     * 喂价周期(s)
     */
    private Long feedInterval;

    /**
     * NFT系列名称
     */
    private String nftName;

    /**
     * 推特@"username"
     */
    private String twitterUsername;

    /**
     * NFT推特id
     */
    private String twitterId;

    /**
     * NFT系列公钥
     */
    private String collectionPublicKey;

    /**
     * 网络等级: 0 本地服务器, 1 开发网, 2 测试网, 3 主网
     */
    private Integer networkLevel;

    /**
     * 起始区块号
     */
    private Long fromBlock;

    /**
     * 事件类型
     */
    private String topicZero;

    /**
     * 目标时间
     */
    private Long targetTime;

    /**
     * 系列官方宣称数量
     */
    private Long announceNumber;

    /**
     * 交易流通数量
     */
    private Long circulationNumber;

    /**
     * tokenId起始位置
     */
    private Long firstTokenId;

    /**
     * tokenId结束位置
     */
    private Long lastTokenId;

    /**
     * 元数据创建完成
     */
    private Integer isMetadataCreated;

    /**
     * 元数据更新坐标
     */
    private Long metadataUpdateOffset;

    /**
     * 元数据更新完成
     */
    private Integer isMetadataUpdated;

    /**
     * 是否支持估价
     */
    private Integer isSupported;

    /**
     * 开始支持估价的时间
     */
    private Long supportedTime;

    /**
     * 支持分析服务
     */
    private Integer isSupportedAnalysis;

    /**
     * 开放估价数据
     */
    private Integer isSupportedValuation;

    /**
     * collection symbol
     */
    private String collectionSymbol;

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


    public static final String ID = "id";

    public static final String CONTRACT_ADDRESS = "contract_address";

    public static final String UPDATE_AUTHORITY = "update_authority";

    public static final String CHAIN_SOURCE = "chain_source";

    public static final String SLUG_SYMBOL = "slug_symbol";

    public static final String NFT_NAME = "nft_name";

    public static final String TWITTER_USERNAME = "twitter_username";

    public static final String TWITTER_ID = "twitter_id";

    public static final String COLLECTION_PUBLIC_KEY = "collection_public_key";

    public static final String CREATE_TIME = "create_time";

    public static final String UPDATE_TIME = "update_time";

    public static final String IS_SUPPORTED_ANALYSIS = "is_supported_analysis";

    public static final String IS_SUPPORTED_VALUATION = "is_supported_valuation";

    public static final String COLLECTION_SYMBOL = "collection_symbol";

}
