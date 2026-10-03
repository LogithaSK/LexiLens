package com.lexilens.classification;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentClassificationService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;
    private final AIResponseParser responseParser;

    private static final Set<String> VALID_TYPES = Set.of(
            "RENTAL_AGREEMENT", "LOAN_AGREEMENT", "EMPLOYMENT_CONTRACT",
            "INSURANCE_POLICY", "TERMS_AND_CONDITIONS", "SERVICE_AGREEMENT", "OTHER"
    );

    public ClassificationResult classify(String text) {
        if (!geminiService.isAvailable()) {
            return ClassificationResult.builder()
                    .documentType("OTHER")
                    .confidence(0.0)
                    .build();
        }

        try {
            String prompt = promptService.classifyDocument(text);
            String response = geminiService.generateContent(prompt);
            Map<String, Object> parsed = responseParser.parseJson(response);

            String docType = responseParser.getField(parsed, "documentType", "OTHER");
            if (!VALID_TYPES.contains(docType)) {
                docType = "OTHER";
            }

            double confidence = responseParser.getDoubleField(parsed, "confidence", 0.5);

            return ClassificationResult.builder()
                    .documentType(docType)
                    .confidence(confidence)
                    .build();
        } catch (Exception e) {
            log.warn("Document classification failed: {}", e.getMessage());
            return ClassificationResult.builder()
                    .documentType("OTHER")
                    .confidence(0.0)
                    .build();
        }
    }
}
