package com.lexilens.dashboard.service;

import com.lexilens.document.entity.AnalysisResult;
import com.lexilens.document.entity.Document;
import com.lexilens.document.entity.DocumentClause;
import com.lexilens.document.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DocumentRepository documentRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final DocumentClauseRepository clauseRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary(Long userId) {
        Map<String, Object> summary = new LinkedHashMap<>();

        long totalDocuments = documentRepository.countByUserId(userId);
        long analyzedDocuments = documentRepository.countByUserIdAndProcessingStatus(
                userId, Document.ProcessingStatus.COMPLETED);

        List<DocumentClause> highRiskClauses = clauseRepository
                .findByDocumentIdAndRiskLevelInOrderByRiskScoreDesc(
                        userId, List.of("HIGH", "CRITICAL"));

        List<DocumentClause> allClauses = clauseRepository.findByDocumentIdOrderByClauseNumber(userId);

        long criticalRisks = allClauses.stream()
                .filter(c -> "CRITICAL".equals(c.getRiskLevel()))
                .count();

        List<Document> recentDocs = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);

        List<Map<String, Object>> riskDistribution = new ArrayList<>();
        Map<String, Long> riskCounts = allClauses.stream()
                .filter(c -> c.getRiskLevel() != null)
                .collect(Collectors.groupingBy(DocumentClause::getRiskLevel, Collectors.counting()));

        for (String level : List.of("LOW", "MEDIUM", "HIGH", "CRITICAL")) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", level);
            item.put("value", riskCounts.getOrDefault(level, 0L));
            riskDistribution.add(item);
        }

        summary.put("totalDocuments", totalDocuments);
        summary.put("analyzedDocuments", analyzedDocuments);
        summary.put("highRiskClauses", highRiskClauses.size());
        summary.put("criticalRisks", criticalRisks);
        summary.put("recentDocuments", recentDocs.stream().limit(5).map(doc -> {
            Map<String, Object> docMap = new LinkedHashMap<>();
            docMap.put("id", doc.getId());
            docMap.put("originalFilename", doc.getOriginalFilename());
            docMap.put("documentType", doc.getDocumentType());
            docMap.put("processingStatus", doc.getProcessingStatus().name());
            docMap.put("uploadedAt", doc.getUploadedAt());
            analysisResultRepository.findByDocumentId(doc.getId()).ifPresent(result -> {
                docMap.put("overallRiskScore", result.getOverallRiskScore());
                docMap.put("overallRiskLevel", result.getOverallRiskLevel());
            });
            return docMap;
        }).collect(Collectors.toList()));

        summary.put("riskDistribution", riskDistribution);

        return summary;
    }
}
