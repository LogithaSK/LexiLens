package com.lexilens.analysis;

import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class SummaryService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;

    public String generateSummary(String text, String documentType) {
        if (!geminiService.isAvailable()) {
            return "AI summary is temporarily unavailable. Document type: " + documentType +
                    ". Please review individual clauses for detailed analysis.";
        }

        try {
            String prompt = promptService.summarizeDocument(text, documentType);
            String summary = geminiService.generateContent(prompt);

            if (summary == null || summary.isBlank()) {
                return "Summary could not be generated. Document type: " + documentType;
            }

            return summary.trim();
        } catch (Exception e) {
            log.warn("Summary generation failed: {}", e.getMessage());
            return "Summary generation failed. Please try again later. Document type: " + documentType;
        }
    }
}
