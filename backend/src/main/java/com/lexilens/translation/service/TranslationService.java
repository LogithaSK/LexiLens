package com.lexilens.translation.service;

import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TranslationService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;

    private static final Map<String, String> LANGUAGE_NAMES = Map.of(
            "en", "English",
            "ta", "Tamil",
            "hi", "Hindi",
            "ml", "Malayalam",
            "te", "Telugu",
            "kn", "Kannada"
    );

    public String translate(String text, String targetLanguage) {
        if (targetLanguage.equals("en")) {
            return text;
        }

        if (!geminiService.isAvailable()) {
            return text + "\n[Translation unavailable]";
        }

        String langName = LANGUAGE_NAMES.getOrDefault(targetLanguage, targetLanguage);

        try {
            String prompt = promptService.translateText(text, langName);
            String translated = geminiService.generateContent(prompt);
            return translated != null ? translated.trim() : text;
        } catch (Exception e) {
            log.warn("Translation to {} failed: {}", langName, e.getMessage());
            return text + "\n[Translation failed]";
        }
    }
}
