package com.lexilens.document.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskAnalysisResponse {
    private Long id;
    private String riskType;
    private Integer riskScore;
    private String reason;
    private String financialImpact;
    private String recommendation;
}
