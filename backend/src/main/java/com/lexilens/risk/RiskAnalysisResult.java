package com.lexilens.risk;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskAnalysisResult {
    private String riskType;
    private String riskLevel;
    private int riskScore;
    private String reason;
    private String financialImpact;
    private String recommendation;
}
