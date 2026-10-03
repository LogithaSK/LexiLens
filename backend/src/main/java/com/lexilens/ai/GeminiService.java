package com.lexilens.ai;

import com.lexilens.common.exception.AIException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    @Retryable(
        value = {ResourceAccessException.class, AIException.class},
        maxAttempts = 3,
        backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key not configured, returning fallback");
            return getFallbackResponse(prompt);
        }

        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + model + ":generateContent?key=" + apiKey;

            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(Map.of("text", prompt)))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.3,
                    "maxOutputTokens", 4096
                )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getBody() != null) {
                List<Map<String, Object>> candidates =
                        (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content =
                            (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, String>> parts =
                            (List<Map<String, String>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return parts.get(0).get("text");
                    }
                }
            }

            throw new AIException("Empty response from Gemini API");
        } catch (AIException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            throw new AIException("AI service error: " + e.getMessage(), e);
        }
    }

    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank();
    }

    private String getFallbackResponse(String prompt) {
        if (prompt.contains("classify")) {
            return "{\"documentType\":\"OTHER\",\"confidence\":0.0}";
        }
        if (prompt.contains("summarize")) {
            return "AI analysis is temporarily unavailable. The document could not be analyzed at this time.";
        }
        return "AI service is currently unavailable. Please try again later.";
    }
}
