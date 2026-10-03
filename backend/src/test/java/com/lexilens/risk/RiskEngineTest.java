package com.lexilens.risk;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RiskEngineTest {

    private final RiskEngine engine = new RiskEngine();

    private List<RiskRule> rulesNamed(String clauseText, String ruleName) {
        return engine.evaluateRules(clauseText).stream()
                .filter(r -> r.getRuleName().equals(ruleName))
                .toList();
    }

    @Test
    @DisplayName("neutral clause triggers no rules and scores zero")
    void neutralClauseTriggersNothing() {
        List<RiskRule> triggered = engine.evaluateRules(
                "The parties shall perform their obligations in a professional manner.");

        assertThat(triggered).isEmpty();
        assertThat(engine.calculateRuleBasedScore(triggered)).isZero();
    }

    @Test
    @DisplayName("penalty language triggers EXCESSIVE_PENALTY worth 15")
    void penaltyRule() {
        assertThat(rulesNamed("A late fee of 2% shall apply to any overdue amount.", "EXCESSIVE_PENALTY"))
                .singleElement()
                .satisfies(r -> {
                    assertThat(r.getRiskType()).isEqualTo("PENALTY_RISK");
                    assertThat(r.getScoreContribution()).isEqualTo(15);
                });
    }

    @Test
    @DisplayName("unlimited liability language is weighted highest at 25")
    void unlimitedLiabilityRule() {
        assertThat(rulesNamed("Supplier accepts unlimited liability for all damages.", "UNLIMITED_LIABILITY"))
                .singleElement()
                .satisfies(r -> {
                    assertThat(r.getRiskType()).isEqualTo("LIABILITY_RISK");
                    assertThat(r.getScoreContribution()).isEqualTo(25);
                });
    }

    @Test
    @DisplayName("one-sided termination is detected across phrasings")
    void oneSidedTerminationRule() {
        assertThat(rulesNamed("Client may terminate at any time without notice.", "ONE_SIDED_TERMINATION"))
                .hasSize(1);
        assertThat(rulesNamed("Landlord may terminate at its sole discretion.", "ONE_SIDED_TERMINATION"))
                .hasSize(1);
    }

    @Test
    @DisplayName("known gap: 'terminate ... without cause' is missed because the pattern is order-sensitive")
    void oneSidedTerminationOrderSensitiveGap() {
        // ONE_SIDED_TERMINATION_PATTERN contains the alternative "without cause.*terminat",
        // which requires the words in that order. The natural legal phrasing puts
        // "terminate" first, so this clause is NOT flagged today.
        // Recorded here so the gap is visible rather than mistaken for intended behaviour.
        assertThat(rulesNamed("Landlord may terminate the lease without cause.", "ONE_SIDED_TERMINATION"))
                .isEmpty();
    }

    @Test
    @DisplayName("auto-renewal detected across common phrasings")
    void autoRenewalRule() {
        assertThat(rulesNamed("This agreement shall renew automatically each year.", "AUTO_RENEWAL"))
                .hasSize(1);
        assertThat(rulesNamed("The term automatically extends for successive periods.", "AUTO_RENEWAL"))
                .hasSize(1);
    }

    @Test
    @DisplayName("short notice flagged only for hour-scale or single-day periods")
    void shortNoticeRule() {
        assertThat(rulesNamed("Either party may terminate on 24 hours notice.", "SHORT_NOTICE"))
                .singleElement()
                .satisfies(r -> {
                    assertThat(r.getScoreContribution()).isEqualTo(12);
                    assertThat(r.getReason()).contains("24 hours notice");
                });

        assertThat(rulesNamed("Notice must be given 1 day notice.", "SHORT_NOTICE")).hasSize(1);

        assertThat(rulesNamed("Notice must be given 30 days notice.", "SHORT_NOTICE")).isEmpty();
        assertThat(rulesNamed("Notice must be given 30 days prior notice.", "SHORT_NOTICE")).isEmpty();
        assertThat(rulesNamed("No notice period is specified.", "SHORT_NOTICE")).isEmpty();
    }

    @Test
    @DisplayName("known gap: hyphenated notice periods are missed by the current pattern")
    void shortNoticeHyphenGap() {
        // SHORT_NOTICE_PATTERN expects whitespace between the number and the unit, so
        // "24-hour notice" does not match. Recorded so the limitation stays visible.
        assertThat(rulesNamed("The supplier may terminate on 24-hour notice.", "SHORT_NOTICE"))
                .isEmpty();
    }

    @Test
    @DisplayName("non-refundable payments detected and scored 18")
    void nonRefundableRule() {
        assertThat(rulesNamed("All deposits are non-refundable.", "NON_REFUNDABLE"))
                .singleElement()
                .satisfies(r -> {
                    assertThat(r.getRiskType()).isEqualTo("FINANCIAL_RISK");
                    assertThat(r.getScoreContribution()).isEqualTo(18);
                });
    }

    @Test
    @DisplayName("multiple risks accumulate rather than short-circuit")
    void rulesAccumulate() {
        String clause = "Tenant shall pay a late penalty. The deposit is non-refundable. "
                + "Landlord may terminate at any time without notice.";

        List<RiskRule> triggered = engine.evaluateRules(clause);

        assertThat(triggered).extracting(RiskRule::getRuleName)
                .contains("EXCESSIVE_PENALTY", "NON_REFUNDABLE", "ONE_SIDED_TERMINATION");
        assertThat(engine.calculateRuleBasedScore(triggered)).isEqualTo(15 + 18 + 15);
    }

    @Test
    @DisplayName("score calculation sums contributions of an empty list to zero")
    void emptyRuleScore() {
        assertThat(engine.calculateRuleBasedScore(List.of())).isZero();
    }

    @Test
    @DisplayName("currency amounts extracted for rupee, dollar and pound formats")
    void financialAmountExtraction() {
        assertThat(engine.extractFinancialImpact("Rent of ₹15,000 per month is payable."))
                .contains("₹15,000");
        assertThat(engine.extractFinancialImpact("A fee of $250.50 applies."))
                .contains("250.50");
        assertThat(engine.extractFinancialImpact("Service charge Rs.1,200 per annum."))
                .contains("1,200");
    }

    @Test
    @DisplayName("multiple amounts joined, and text without figures returns null")
    void financialAmountEdgeCases() {
        assertThat(engine.extractFinancialImpact("Costs of ₹5,000 plus $100 are due."))
                .contains("₹5,000")
                .contains("$100")
                .contains(",");
        assertThat(engine.extractFinancialImpact("No monetary amounts appear here.")).isNull();
        assertThat(engine.extractFinancialImpact("")).isNull();
    }
}
