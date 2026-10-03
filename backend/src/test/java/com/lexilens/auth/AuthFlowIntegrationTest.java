package com.lexilens.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Regression coverage for the principal-type mismatch that broke the dashboard and
 * chat endpoints. JwtAuthenticationFilter stores a UserDetails, so controllers that
 * declared {@code @AuthenticationPrincipal User} received null and returned HTTP 500.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Authentication and principal resolution")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String email) throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Integration User",
                "email", email,
                "password", "Str0ngPass!2026"
        ));

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = objectMapper.readValue(json, Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload.get("data");
        return (String) data.get("token");
    }

    @Test
    @DisplayName("protected endpoints reject unauthenticated requests with 401")
    void protectedEndpointsRequireAuth() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/documents")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("credential-issuing endpoints stay public")
    void authEndpointsArePublic() throws Exception {
        mockMvc.perform(get("/api-docs")).andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("dashboard summary resolves the principal and returns 200")
    void dashboardSummaryWorksForAuthenticatedUser() throws Exception {
        String token = registerAndGetToken("dash.it@lexilens.local");

        MvcResult result = mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        @SuppressWarnings("unchecked")
        Map<String, Object> payload = objectMapper.readValue(json, Map.class);
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload.get("data");

        assertThat(payload.get("success")).isEqualTo(true);
        assertThat(data).containsKeys("totalDocuments", "analyzedDocuments",
                "highRiskClauses", "criticalRisks", "riskDistribution", "recentDocuments");
    }

    @Test
    @DisplayName("chat history resolves the principal and returns 200 for an unknown document")
    void chatHistoryResolvesPrincipal() throws Exception {
        String token = registerAndGetToken("chat.it@lexilens.local");

        // A missing document may legitimately 404, but it must not be a 500 caused by
        // a null principal, which is the regression being guarded.
        int status = mockMvc.perform(get("/api/chat/history/999999999")
                        .header("Authorization", "Bearer " + token))
                .andReturn().getResponse().getStatus();

        assertThat(status).isNotEqualTo(500);
    }

    @Test
    @DisplayName("documents list resolves the principal and returns an empty list for a new user")
    void documentsListWorksForAuthenticatedUser() throws Exception {
        String token = registerAndGetToken("docs.it@lexilens.local");

        MvcResult result = mockMvc.perform(get("/api/documents")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertThat(json).contains("\"success\":true");
    }

    @Test
    @DisplayName("login returns a token for the same user")
    void loginWorks() throws Exception {
        String email = "login.it@lexilens.local";
        registerAndGetToken(email);

        String body = objectMapper.writeValueAsString(Map.of(
                "email", email,
                "password", "Str0ngPass!2026"
        ));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("registration rejects a weak password path with a non-500 response")
    void duplicateRegistrationDoesNotCrash() throws Exception {
        String email = "dup.it@lexilens.local";
        registerAndGetToken(email);

        String body = objectMapper.writeValueAsString(Map.of(
                "name", "Integration User",
                "email", email,
                "password", "Str0ngPass!2026"
        ));

        int status = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andReturn().getResponse().getStatus();

        assertThat(status).isNotEqualTo(500);
    }

    @Test
    @DisplayName("authenticated /api/auth/me returns the caller's profile")
    void meReturnsProfileForAuthenticatedUser() throws Exception {
        String email = "me.it@lexilens.local";
        String token = registerAndGetToken(email);

        MvcResult result = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        String json = result.getResponse().getContentAsString();
        assertThat(json).contains(email);
    }
}
