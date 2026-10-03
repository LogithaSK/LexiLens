package com.lexilens.risk;

public enum RiskLevel {
    LOW("LOW", 0, 25),
    MEDIUM("MEDIUM", 26, 50),
    HIGH("HIGH", 51, 75),
    CRITICAL("CRITICAL", 76, 100);

    private final String label;
    private final int minScore;
    private final int maxScore;

    RiskLevel(String label, int minScore, int maxScore) {
        this.label = label;
        this.minScore = minScore;
        this.maxScore = maxScore;
    }

    public String getLabel() {
        return label;
    }

    public static RiskLevel fromScore(int score) {
        if (score <= 25) return LOW;
        if (score <= 50) return MEDIUM;
        if (score <= 75) return HIGH;
        return CRITICAL;
    }
}
