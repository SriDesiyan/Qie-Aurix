package discord.bot.interfaces.query.command.cmd;

import lombok.Data;

import java.io.Serializable;

/**
 * 收集非功能性测试命令
 *
 * @author qiang
 * @date 2022/11/28
 */
@Data
public class CollectionNftCommand implements Serializable {

    /**
     * 白名单id
     */
    private String contractAddress;

    /**
     * tokenId
     */
    private String tokenId;
}
