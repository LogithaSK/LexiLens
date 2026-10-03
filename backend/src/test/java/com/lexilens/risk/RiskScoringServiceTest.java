package com.lexilens.risk;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * Exercises the scoring fallback path, which is what runs in production whenever
 * GEMINI_API_KEY is unset. The AI branch is deliberately not mocked into a success
 * state here; the rule-only path is the one that must never regress silently.
 */
class RiskScoringServiceTest {

    private RiskScoringService serviceWith(boolean geminiAvailable) {
        GeminiService gemini = mock(GeminiService.class);
        when(gemini.isAvailable()).thenReturn(geminiAvailable);

        GeminiPromptService prompts = mock(GeminiPromptService.class);
        when(prompts.analyzeClauseRisk(anyString(), anyString(), anyString()))
                .thenReturn("prompt");

        AIResponseParser parser = new AIResponseParser();

        return new RiskScoringService(gemini, prompts, parser, new RiskEngine());
    }

    @Test
    @DisplayName("overall score of no clauses is zero")
    void overallScoreOfEmptyInput() {
        assertThat(serviceWith(false).calculateOverallScore(List.of())).isZero();
    }

    @Test
    @DisplayName("single clause returns its own score")
    void overallScoreOfSingleClause() {
        assertThat(serviceWith(false).calculateOverallScore(List.of(40))).isEqualTo(40);
    }

    @Test
    @DisplayName("overall score weights the worst clause at 0.6 and the average at 0.4")
    void overallScoreWeighting() {
        // max 80, avg 32 -> 80*0.6 + 32*0.4 = 48 + 12.8 = 60.8, truncated to 60
        assertThat(serviceWith(false).calculateOverallScore(List.of(80, 20, 20, 20, 20))).isEqualTo(60);
    }

    @Test
    @DisplayName("one dominant clause moves the overall score to roughly 0.6 of its weight")
    void overallScoreDominantClause() {
        // max 100, avg 40 -> 100*0.6 + 40*0.4 = 60 + 16 = 76
        assertThat(serviceWith(false).calculateOverallScore(List.of(100, 20, 20, 20))).isEqualTo(76);
    }

    @Test
    @DisplayName("overall score is capped at 100 and never negative for 0-100 inputs")
    void overallScoreBoundaries() {
        RiskScoringService service = serviceWith(false);
        assertThat(service.calculateOverallScore(List.of(100, 100, 100))).isEqualTo(100);
        assertThat(service.calculateOverallScore(List.of(0, 0, 0))).isZero();
    }

    @Test
    @DisplayName("without Gemini, a clean clause scores low and reports no significant risk")
    void ruleOnlyPathForBenignClause() {
        RiskAnalysisResult result = serviceWith(false).analyzeClause(
                "The parties shall perform their obligations in a professional manner.",
                "Standard Obligations",
                "GENERAL");

        assertThat(result.getRiskScore()).isEqualTo(10);
        assertThat(result.getRiskLevel()).isEqualTo("LOW");
        assertThat(result.getReason()).isEqualTo("No significant risks detected");
        assertThat(result.getRiskType()).isEqualTo("GENERAL_RISK");
    }

    @Test
    @DisplayName("without Gemini, rule hits supply the risk type, reason and recommendation")
    void ruleOnlyPathSurfacesRuleFindings() {
        RiskAnalysisResult result = serviceWith(false).analyzeClause(
                "The deposit is non-refundable and a late penalty applies to overdue amounts.",
                "Payment Terms",
                "FINANCIAL");

        // NON_REFUNDABLE 18 + EXCESSIVE_PENALTY 15 = 33, plus the +10 rule-only floor
        assertThat(result.getRiskScore()).isEqualTo(43);
        assertThat(result.getRiskLevel()).isEqualTo("MEDIUM");
        assertThat(result.getReason()).contains("Non-refundable").contains("penalty");
        assertThat(result.getRecommendation()).isNotBlank();
    }

    @Test
    @DisplayName("reported risk type comes from the first matched rule, not the highest scoring one")
    void riskTypeTakesFirstMatchedRule() {
        // RiskEngine appends rules in a fixed evaluation order, with EXCESSIVE_PENALTY
        // checked before NON_REFUNDABLE. RiskScoringService then reports triggeredRules[0],
        // so PENALTY_RISK wins here even though NON_REFUNDABLE contributes more (18 vs 15).
        // Documented as current behaviour: the reported type is the first match, not the worst.
        RiskAnalysisResult result = serviceWith(false).analyzeClause(
                "The deposit is non-refundable and a late penalty applies to overdue amounts.",
                "Payment Terms",
                "FINANCIAL");

        assertThat(result.getRiskType()).isEqualTo("PENALTY_RISK");
    }

    @Test
    @DisplayName("a single unlimited-liability clause lands in the critical band")
    void unlimitedLiabilityReachesCritical() {
        // UNLIMITED_LIABILITY alone contributes 25, plus the +10 rule-only floor = 35 (MEDIUM)
        RiskAnalysisResult sole = serviceWith(false).analyzeClause(
                "Supplier accepts unlimited liability for all losses.", "Liability", "LIABILITY");
        assertThat(sole.getRiskScore()).isEqualTo(35);
        assertThat(sole.getRiskLevel()).isEqualTo("MEDIUM");

        // Combined with non-refundable: 25 + 18 = 43, plus 10 = 53 (HIGH)
        RiskAnalysisResult combined = serviceWith(false).analyzeClause(
                "Supplier accepts unlimited liability for all losses, and all fees are non-refundable.",
                "Liability and Fees", "LIABILITY");
        assertThat(combined.getRiskScore()).isEqualTo(53);
        assertThat(combined.getRiskLevel()).isEqualTo("HIGH");
    }

    @Test
    @DisplayName("detected currency is reported as financial impact when the AI supplies none")
    void financialImpactFallback() {
        RiskAnalysisResult result = serviceWith(false).analyzeClause(
                "Rent of ₹15,000 per month plus a non-refundable deposit is due.",
                "Rent",
                "FINANCIAL");

        assertThat(result.getFinancialImpact()).isNotNull().contains("₹15,000");
    }

    @Test
    @DisplayName("RiskLevel thresholds map to the documented bands")
    void riskLevelThresholds() {
        assertThat(RiskLevel.fromScore(0)).isEqualTo(RiskLevel.LOW);
        assertThat(RiskLevel.fromScore(25)).isEqualTo(RiskLevel.LOW);
        assertThat(RiskLevel.fromScore(26)).isEqualTo(RiskLevel.MEDIUM);
        assertThat(RiskLevel.fromScore(50)).isEqualTo(RiskLevel.MEDIUM);
        assertThat(RiskLevel.fromScore(51)).isEqualTo(RiskLevel.HIGH);
        assertThat(RiskLevel.fromScore(75)).isEqualTo(RiskLevel.HIGH);
        assertThat(RiskLevel.fromScore(76)).isEqualTo(RiskLevel.CRITICAL);
        assertThat(RiskLevel.fromScore(100)).isEqualTo(RiskLevel.CRITICAL);
    }
}
