package com.lexilens.ai;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class AIResponseParser {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parseJson(String response) {
        try {
            String cleaned = cleanJsonResponse(response);
            return objectMapper.readValue(cleaned, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse JSON response: {}", e.getMessage());
            return Collections.emptyMap();
        }
    }

    public List<Map<String, Object>> parseJsonArray(String response) {
        try {
            String cleaned = cleanJsonResponse(response);
            return objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            log.error("Failed to parse JSON array response: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    public String getField(Map<String, Object> map, String key, String defaultValue) {
        Object value = map.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    public int getIntField(Map<String, Object> map, String key, int defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return defaultValue;
    }

    public double getDoubleField(Map<String, Object> map, String key, double defaultValue) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return defaultValue;
    }

    private String cleanJsonResponse(String response) {
        if (response == null) return "{}";

        String cleaned = response.trim();

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');

        if (start >= 0 && end > start) {
            cleaned = cleaned.substring(start, end + 1);
        } else {
            int arrayStart = cleaned.indexOf('[');
            int arrayEnd = cleaned.lastIndexOf(']');
            if (arrayStart >= 0 && arrayEnd > arrayStart) {
                cleaned = cleaned.substring(arrayStart, arrayEnd + 1);
            }
        }

        cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "");

        return cleaned;
    }
}
