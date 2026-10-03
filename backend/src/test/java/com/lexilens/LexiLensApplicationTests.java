package com.lexilens;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Smoke test: proves the application context wires up against H2, so bean wiring
 * and JPA mappings are checked without needing a live PostgreSQL instance.
 */
@SpringBootTest
@DisplayName("Application context smoke test")
class LexiLensApplicationTests {

    @Autowired
    private ApplicationContext context;

    @Test
    @DisplayName("context loads with all core beans present")
    void contextLoads() {
        assertThat(context).isNotNull();
        assertThat(context.getBean(com.lexilens.risk.RiskEngine.class)).isNotNull();
        assertThat(context.getBean(com.lexilens.risk.RiskScoringService.class)).isNotNull();
        assertThat(context.getBean(com.lexilens.auth.service.AuthService.class)).isNotNull();
        assertThat(context.getBean(com.lexilens.extraction.TextExtractionServiceFactory.class)).isNotNull();
    }

    @Test
    @DisplayName("JPA repositories are registered for user, document and chat data")
    void repositoriesAreRegistered() {
        assertThat(context.getBean(com.lexilens.auth.repository.UserRepository.class)).isNotNull();
        assertThat(context.getBean(com.lexilens.document.repository.DocumentRepository.class)).isNotNull();
        assertThat(context.getBean(com.lexilens.chat.repository.ChatRepository.class)).isNotNull();
    }
}
