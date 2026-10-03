package com.lexilens.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_analysis")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "clause_id", nullable = false)
    private DocumentClause clause;

    @Column(name = "risk_type", nullable = false)
    private String riskType;

    @Column(name = "risk_score", nullable = false)
    private Integer riskScore;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "financial_impact", columnDefinition = "TEXT")
    private String financialImpact;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
