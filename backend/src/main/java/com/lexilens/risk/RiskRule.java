package com.lexilens.risk;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RiskRule {
    private String ruleName;
    private String riskType;
    private int scoreContribution;
    private String reason;
    private String recommendation;
}
