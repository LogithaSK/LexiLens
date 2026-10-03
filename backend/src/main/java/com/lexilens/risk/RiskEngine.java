package com.lexilens.risk;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class RiskEngine {

    private static final Pattern PENALTY_PATTERN = Pattern.compile(
            "(?i)(penalt|fine|late fee|liquidated damages|forfeit|forfeiture|charge.*late)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern UNLIMITED_LIABILITY_PATTERN = Pattern.compile(
            "(?i)(unlimited liability|without limitation|all losses|all damages|full responsibility)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern ONE_SIDED_TERMINATION_PATTERN = Pattern.compile(
            "(?i)(sole discretion|may terminate at any time|without notice|without cause.*terminat)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern AUTO_RENEWAL_PATTERN = Pattern.compile(
            "(?i)(automatic.*renew|auto.*renew|automatically extend|shall renew)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern SHORT_NOTICE_PATTERN = Pattern.compile(
            "(?i)((?:\\d+)\\s*(?:day|hour|week)s?\\s*(?:notice|written notice|prior notice))",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern NON_REFUNDABLE_PATTERN = Pattern.compile(
            "(?i)(non.?refundable|no refund|not eligible for refund|irrevocable)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern PAYMENT_PATTERN = Pattern.compile(
            "(?i)(pay|payment|rent|deposit|fee|charge|cost|amount|₹|\\$|Rs\\.)",
            Pattern.CASE_INSENSITIVE);

    private static final Pattern FINANCIAL_AMOUNT_PATTERN = Pattern.compile(
            "(?:₹|\\$|Rs\\.?)\\s*[\\d,]+(?:\\.\\d{1,2})?(?:\\s*(?:per|/|each)\\s*(?:month|year|day|annum))?",
            Pattern.CASE_INSENSITIVE);

    public List<RiskRule> evaluateRules(String clauseText) {
        List<RiskRule> triggered = new ArrayList<>();

        if (PENALTY_PATTERN.matcher(clauseText).find()) {
            triggered.add(RiskRule.builder()
                    .ruleName("EXCESSIVE_PENALTY")
                    .riskType("PENALTY_RISK")
                    .scoreContribution(15)
                    .reason("Clause contains penalty or fine provisions")
                    .recommendation("Review the penalty amount and conditions carefully")
                    .build());
        }

        if (UNLIMITED_LIABILITY_PATTERN.matcher(clauseText).find()) {
            triggered.add(RiskRule.builder()
                    .ruleName("UNLIMITED_LIABILITY")
                    .riskType("LIABILITY_RISK")
                    .scoreContribution(25)
                    .reason("Clause may impose unlimited liability")
                    .recommendation("Consider negotiating a liability cap")
                    .build());
        }

        if (ONE_SIDED_TERMINATION_PATTERN.matcher(clauseText).find()) {
            triggered.add(RiskRule.builder()
                    .ruleName("ONE_SIDED_TERMINATION")
                    .riskType("TERMINATION_RISK")
                    .scoreContribution(15)
                    .reason("Clause allows one-sided termination without cause")
                    .recommendation("Negotiate mutual termination rights")
                    .build());
        }

        if (AUTO_RENEWAL_PATTERN.matcher(clauseText).find()) {
            triggered.add(RiskRule.builder()
                    .ruleName("AUTO_RENEWAL")
                    .riskType("RENEWAL_RISK")
                    .scoreContribution(10)
                    .reason("Automatic renewal clause detected")
                    .recommendation("Check notice period required to prevent automatic renewal")
                    .build());
        }

        Matcher noticeMatcher = SHORT_NOTICE_PATTERN.matcher(clauseText);
        if (noticeMatcher.find()) {
            String noticeText = noticeMatcher.group();
            if (noticeText.toLowerCase().contains("hour") ||
                (noticeText.contains("1 ") && noticeText.toLowerCase().contains("day"))) {
                triggered.add(RiskRule.builder()
                        .ruleName("SHORT_NOTICE")
                        .riskType("NOTICE_RISK")
                        .scoreContribution(12)
                        .reason("Very short notice period detected: " + noticeText)
                        .recommendation("Check if the notice period is sufficient for your needs")
                        .build());
            }
        }

        if (NON_REFUNDABLE_PATTERN.matcher(clauseText).find()) {
            triggered.add(RiskRule.builder()
                    .ruleName("NON_REFUNDABLE")
                    .riskType("FINANCIAL_RISK")
                    .scoreContribution(18)
                    .reason("Non-refundable payment clause detected")
                    .recommendation("Understand what payments are non-refundable and under what conditions")
                    .build());
        }

        return triggered;
    }

    public int calculateRuleBasedScore(List<RiskRule> rules) {
        return rules.stream()
                .mapToInt(RiskRule::getScoreContribution)
                .sum();
    }

    public String extractFinancialImpact(String clauseText) {
        Matcher matcher = FINANCIAL_AMOUNT_PATTERN.matcher(clauseText);
        StringBuilder impacts = new StringBuilder();
        while (matcher.find()) {
            if (!impacts.isEmpty()) impacts.append(", ");
            impacts.append(matcher.group());
        }
        return impacts.isEmpty() ? null : impacts.toString();
    }
}
