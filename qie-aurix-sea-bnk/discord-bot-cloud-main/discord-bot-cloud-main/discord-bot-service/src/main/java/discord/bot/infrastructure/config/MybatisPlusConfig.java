package discord.bot.infrastructure.config;

import com.baomidou.mybatisplus.extension.plugins.PaginationInterceptor;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@EnableTransactionManagement
@Configuration
@MapperScan("discord.bot.infrastructure.db")
public class MybatisPlusConfig {

    @Bean
    public PaginationInterceptor paginationInterceptor() {
        // paginationInterceptor.setOverflow(false);
        // paginationInterceptor.setLimit(500);
        return new PaginationInterceptor();
    }

    @Bean
    public MySqlInjector sqlInjector() {
        return new MySqlInjector();
    }

}
