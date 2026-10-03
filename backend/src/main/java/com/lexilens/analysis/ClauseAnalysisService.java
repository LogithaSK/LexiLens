package com.lexilens.analysis;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import com.lexilens.document.entity.DocumentClause;
import com.lexilens.document.entity.Document;
import com.lexilens.document.entity.RiskAnalysis;
import com.lexilens.document.repository.DocumentClauseRepository;
import com.lexilens.document.repository.RiskAnalysisRepository;
import com.lexilens.risk.RiskAnalysisResult;
import com.lexilens.risk.RiskLevel;
import com.lexilens.risk.RiskScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClauseAnalysisService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;
    private final AIResponseParser responseParser;
    private final DocumentClauseRepository clauseRepository;
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final RiskScoringService riskScoringService;

    public List<Map<String, Object>> extractClausesWithAI(String text) {
        if (!geminiService.isAvailable()) {
            return extractClausesFallback(text);
        }

        try {
            String prompt = promptService.extractClauses(text);
            String response = geminiService.generateContent(prompt);
            List<Map<String, Object>> clauses = responseParser.parseJsonArray(response);

            if (clauses.isEmpty()) {
                log.warn("AI clause extraction returned empty, falling back");
                return extractClausesFallback(text);
            }

            return clauses;
        } catch (Exception e) {
            log.warn("AI clause extraction failed, using fallback: {}", e.getMessage());
            return extractClausesFallback(text);
        }
    }

    private List<Map<String, Object>> extractClausesFallback(String text) {
        List<Map<String, Object>> clauses = new ArrayList<>();
        String[] paragraphs = text.split("\\n\\n+");

        int clauseNum = 1;
        for (String para : paragraphs) {
            String trimmed = para.trim();
            if (trimmed.length() > 50) {
                Map<String, Object> clause = new HashMap<>();
                clause.put("clauseNumber", clauseNum);
                clause.put("title", "Section " + clauseNum);
                clause.put("category", "OTHER");
                clause.put("originalText", trimmed);
                clauses.add(clause);
                clauseNum++;
            }
        }

        if (clauses.isEmpty() && !text.isBlank()) {
            Map<String, Object> clause = new HashMap<>();
            clause.put("clauseNumber", 1);
            clause.put("title", "Full Document");
            clause.put("category", "OTHER");
            clause.put("originalText", text.length() > 10000 ? text.substring(0, 10000) : text);
            clauses.add(clause);
        }

        return clauses;
    }

    public DocumentClause processClause(Document document, Map<String, Object> aiClause, String fullText) {
        try {
            String originalText = responseParser.getField(aiClause, "originalText", "");
            String title = responseParser.getField(aiClause, "title", "Untitled Clause");
            String category = responseParser.getField(aiClause, "category", "OTHER");
            int clauseNumber = responseParser.getIntField(aiClause, "clauseNumber", 0);

            if (originalText.isBlank()) return null;

            String simplifiedText = simplifyClause(originalText, title);

            RiskAnalysisResult riskResult = riskScoringService.analyzeClause(originalText, title, category);

            DocumentClause clause = DocumentClause.builder()
                    .document(document)
                    .clauseNumber(clauseNumber)
                    .title(title)
                    .category(category)
                    .originalText(originalText)
                    .simplifiedText(simplifiedText)
                    .riskLevel(riskResult.getRiskLevel())
                    .riskScore(riskResult.getRiskScore())
                    .build();

            clause = clauseRepository.save(clause);

            RiskAnalysis riskAnalysis = RiskAnalysis.builder()
                    .clause(clause)
                    .riskType(riskResult.getRiskType())
                    .riskScore(riskResult.getRiskScore())
                    .reason(riskResult.getReason())
                    .financialImpact(riskResult.getFinancialImpact())
                    .recommendation(riskResult.getRecommendation())
                    .build();

            riskAnalysisRepository.save(riskAnalysis);

            return clause;
        } catch (Exception e) {
            log.error("Failed to process clause: {}", e.getMessage());
            return null;
        }
    }

    private String simplifyClause(String clauseText, String title) {
        if (!geminiService.isAvailable()) {
            return "Simplification unavailable. Please review the original clause text.";
        }

        try {
            String prompt = promptService.simplifyClause(clauseText, title);
            String response = geminiService.generateContent(prompt);
            Map<String, Object> parsed = responseParser.parseJson(response);
            return responseParser.getField(parsed, "simplifiedText",
                    responseParser.getField(parsed, "whatThisMeans", response));
        } catch (Exception e) {
            log.warn("Clause simplification failed for '{}': {}", title, e.getMessage());
            return "Simplification could not be generated at this time.";
        }
    }
}
