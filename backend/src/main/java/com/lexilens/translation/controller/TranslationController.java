package com.lexilens.translation.controller;

import com.lexilens.common.response.ApiResponse;
import com.lexilens.translation.service.TranslationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/translate")
@RequiredArgsConstructor
@Tag(name = "Translation", description = "Multilingual translation endpoints")
public class TranslationController {

    private final TranslationService translationService;

    @PostMapping
    @Operation(summary = "Translate text to target language")
    public ResponseEntity<ApiResponse<Map<String, String>>> translate(@RequestBody TranslationRequest request) {
        String translated = translationService.translate(request.getText(), request.getTargetLanguage());
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "translatedText", translated,
                "targetLanguage", request.getTargetLanguage()
        )));
    }

    @Data
    public static class TranslationRequest {
        @NotBlank(message = "Text is required")
        private String text;
        @NotBlank(message = "Target language is required")
        private String targetLanguage;
    }
}
