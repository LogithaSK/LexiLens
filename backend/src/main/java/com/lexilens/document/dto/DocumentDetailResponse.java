package com.lexilens.document.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DocumentDetailResponse {
    private Long id;
    private String filename;
    private String originalFilename;
    private String fileType;
    private String documentType;
    private String processingStatus;
    private String summary;
    private Integer overallRiskScore;
    private String overallRiskLevel;
    private String keyFindings;
    private List<ClauseResponse> clauses;
    private List<RiskAnalysisResponse> risks;
    private LocalDateTime uploadedAt;
}
