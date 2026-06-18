package discord.bot.application.exception;


/**
 * 基地例外
 *
 * @author qiang
 * @date 2022/11/28
 */
public interface BaseException {

    /**
     * 获取代码
     *
     * @return int
     */
    String getCode();

    /**
     * 得到消息
     *
     * @return {@link String}
     */
    String getMessage();

    /**
     * 获取内容
     *
     * @return {@link Object}
     */
    Object getContent();
}
