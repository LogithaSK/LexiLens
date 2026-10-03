package com.lexilens.risk;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RiskScoringService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;
    private final AIResponseParser responseParser;
    private final RiskEngine riskEngine;

    public RiskAnalysisResult analyzeClause(String clauseText, String clauseTitle, String clauseCategory) {
        int ruleScore = 0;
        String aiRiskType = "GENERAL_RISK";
        String aiReason = "";
        String aiFinancialImpact = null;
        String aiRecommendation = "";

        if (geminiService.isAvailable()) {
            try {
                String prompt = promptService.analyzeClauseRisk(clauseText, clauseTitle, clauseCategory);
                String response = geminiService.generateContent(prompt);
                Map<String, Object> parsed = responseParser.parseJson(response);

                aiRiskType = responseParser.getField(parsed, "riskType", "GENERAL_RISK");
                aiReason = responseParser.getField(parsed, "reason", "");
                aiFinancialImpact = responseParser.getField(parsed, "financialImpact", null);
                aiRecommendation = responseParser.getField(parsed, "recommendation", "");
                ruleScore = responseParser.getIntField(parsed, "riskScore", 0);
            } catch (Exception e) {
                log.warn("AI risk analysis failed for clause '{}', using rule-based only: {}", clauseTitle, e.getMessage());
            }
        }

        java.util.List<RiskRule> triggeredRules = riskEngine.evaluateRules(clauseText);
        int ruleBasedScore = riskEngine.calculateRuleBasedScore(triggeredRules);

        int finalScore;
        if (ruleScore > 0) {
            finalScore = Math.min(100, (ruleScore + ruleBasedScore) / 2 + ruleBasedScore / 2);
        } else {
            finalScore = Math.min(100, ruleBasedScore + 10);
        }

        String ruleReasons = "";
        for (RiskRule rule : triggeredRules) {
            if (!ruleReasons.isEmpty()) ruleReasons += "; ";
            ruleReasons += rule.getReason();
        }

        if (aiReason.isEmpty() && !ruleReasons.isEmpty()) {
            aiReason = ruleReasons;
        } else if (!aiReason.isEmpty() && !ruleReasons.isEmpty()) {
            aiReason = aiReason + " Additionally: " + ruleReasons;
        }

        if (aiRecommendation.isEmpty() && !triggeredRules.isEmpty()) {
            aiRecommendation = triggeredRules.get(0).getRecommendation();
        }

        if (aiFinancialImpact == null) {
            String detectedFinancial = riskEngine.extractFinancialImpact(clauseText);
            if (detectedFinancial != null) {
                aiFinancialImpact = "Detected financial references: " + detectedFinancial;
            }
        }

        if (aiRiskType.equals("GENERAL_RISK") && !triggeredRules.isEmpty()) {
            aiRiskType = triggeredRules.get(0).getRiskType();
        }

        RiskLevel level = RiskLevel.fromScore(finalScore);

        return RiskAnalysisResult.builder()
                .riskType(aiRiskType)
                .riskLevel(level.getLabel())
                .riskScore(finalScore)
                .reason(aiReason.isEmpty() ? "No significant risks detected" : aiReason)
                .financialImpact(aiFinancialImpact)
                .recommendation(aiRecommendation.isEmpty() ?
                        "Review this clause carefully before signing" : aiRecommendation)
                .build();
    }

    public int calculateOverallScore(java.util.List<Integer> clauseScores) {
        if (clauseScores.isEmpty()) return 0;
        int max = clauseScores.stream().mapToInt(Integer::intValue).max().orElse(0);
        double avg = clauseScores.stream().mapToInt(Integer::intValue).average().orElse(0);
        return (int) Math.min(100, (max * 0.6) + (avg * 0.4));
    }
}
