package discord.bot.application.exception;


import cn.hutool.core.util.StrUtil;
import com.gecko.cloud.kit.rest.ResponseData;
import lombok.Getter;
import lombok.Setter;

/**
 * 业务异常
 *
 * @author qiang
 * @date 2022/11/28
 */
@Getter
@Setter
public class BusinessException extends RuntimeException implements BaseException {

    private String code;
    private String message;
    private Object content;

    public BusinessException(ResponseData<Object> responseCode) {
        this.code = responseCode.getCode();
        this.message = responseCode.getMessage();
    }

    public BusinessException(ResponseData<Object> responseCode, String... params) {
        this.code = responseCode.getCode();
        this.message = StrUtil.format(responseCode.getMessage(), (Object[]) params);
    }

    public BusinessException(ResponseData<Object> responseCode, Object obj, String... params) {
        this.code = responseCode.getCode();
        this.content = obj;
        this.message = StrUtil.format(responseCode.getMessage(), (Object[]) params);
    }


    public BusinessException(String code, String message) {
        this.code = code;
        this.message = message;
    }

    /**
     * 不写入堆栈信息，提高性能
     */
    @Override
    public Throwable fillInStackTrace() {
        return this;
    }
}
