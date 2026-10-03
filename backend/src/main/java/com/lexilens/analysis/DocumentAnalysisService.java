package com.lexilens.analysis;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import com.lexilens.classification.DocumentClassificationService;
import com.lexilens.document.entity.AnalysisResult;
import com.lexilens.document.entity.Document;
import com.lexilens.document.entity.DocumentClause;
import com.lexilens.document.repository.AnalysisResultRepository;
import com.lexilens.document.repository.DocumentClauseRepository;
import com.lexilens.document.repository.DocumentRepository;
import com.lexilens.extraction.TextExtractionServiceFactory;
import com.lexilens.risk.RiskLevel;
import com.lexilens.risk.RiskScoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentAnalysisService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;
    private final AIResponseParser responseParser;
    private final DocumentRepository documentRepository;
    private final DocumentClauseRepository clauseRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final RiskScoringService riskScoringService;
    private final ClauseAnalysisService clauseAnalysisService;
    private final SummaryService summaryService;
    private final DocumentClassificationService classificationService;
    private final TextExtractionServiceFactory extractionServiceFactory;

    @Async
    @Transactional
    public void analyzeDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new com.lexilens.common.exception.ResourceNotFoundException("Document not found"));

        try {
            document.setProcessingStatus(Document.ProcessingStatus.ANALYZING);
            documentRepository.save(document);

            String text = document.getExtractedText();
            if (text == null || text.isBlank()) {
                document.setProcessingStatus(Document.ProcessingStatus.FAILED);
                documentRepository.save(document);
                return;
            }

            var classification = classificationService.classify(text);
            document.setDocumentType(classification.getDocumentType());
            documentRepository.save(document);

            log.info("Document {} classified as {} with confidence {}",
                    documentId, classification.getDocumentType(), classification.getConfidence());

            String summary = summaryService.generateSummary(text, classification.getDocumentType());

            List<Map<String, Object>> aiClauses = clauseAnalysisService.extractClausesWithAI(text);
            List<DocumentClause> savedClauses = new ArrayList<>();

            for (Map<String, Object> aiClause : aiClauses) {
                DocumentClause clause = clauseAnalysisService.processClause(document, aiClause, text);
                if (clause != null) {
                    savedClauses.add(clause);
                }
            }

            clauseRepository.saveAll(savedClauses);

            List<Integer> clauseScores = savedClauses.stream()
                    .map(c -> c.getRiskScore() != null ? c.getRiskScore() : 0)
                    .collect(Collectors.toList());

            int overallScore = riskScoringService.calculateOverallScore(clauseScores);
            RiskLevel overallLevel = RiskLevel.fromScore(overallScore);

            List<Map<String, Object>> highRiskClauses = savedClauses.stream()
                    .filter(c -> c.getRiskScore() != null && c.getRiskScore() > 50)
                    .map(c -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("title", c.getTitle());
                        map.put("riskLevel", c.getRiskLevel());
                        map.put("riskScore", c.getRiskScore());
                        return map;
                    })
                    .collect(Collectors.toList());

            String keyFindings = generateKeyFindings(summary, highRiskClauses);

            AnalysisResult result = AnalysisResult.builder()
                    .document(document)
                    .summary(summary)
                    .overallRiskScore(overallScore)
                    .overallRiskLevel(overallLevel.getLabel())
                    .keyFindings(keyFindings)
                    .build();

            analysisResultRepository.save(result);

            document.setProcessingStatus(Document.ProcessingStatus.COMPLETED);
            documentRepository.save(document);

            log.info("Analysis completed for document {}: risk={}, score={}",
                    documentId, overallLevel.getLabel(), overallScore);

        } catch (Exception e) {
            log.error("Analysis failed for document {}: {}", documentId, e.getMessage());
            document.setProcessingStatus(Document.ProcessingStatus.FAILED);
            documentRepository.save(document);
        }
    }

    private String generateKeyFindings(String summary, List<Map<String, Object>> highRiskClauses) {
        if (!geminiService.isAvailable()) {
            if (highRiskClauses.isEmpty()) {
                return "No significant risks identified.";
            }
            String findings = highRiskClauses.stream()
                    .map(c -> "- " + c.get("title") + " (" + c.get("riskLevel") + " risk)")
                    .collect(Collectors.joining("\n"));
            return "High-risk clauses identified:\n" + findings;
        }

        try {
            String prompt = promptService.generateKeyFindings(summary, highRiskClauses);
            String response = geminiService.generateContent(prompt);
            List<String> findings = responseParser.parseJsonArray(response).stream()
                    .map(m -> responseParser.getField(m, "value", m.toString()))
                    .collect(Collectors.toList());
            if (findings.isEmpty()) {
                return response;
            }
            return String.join("\n", findings);
        } catch (Exception e) {
            log.warn("Key findings generation failed: {}", e.getMessage());
            return "Key findings could not be generated. Please review individual clauses.";
        }
    }
}
