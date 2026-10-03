package com.lexilens.document.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ClauseResponse {
    private Long id;
    private Integer clauseNumber;
    private String title;
    private String category;
    private String originalText;
    private String simplifiedText;
    private String riskLevel;
    private Integer riskScore;
    private List<RiskAnalysisResponse> risks;
}
