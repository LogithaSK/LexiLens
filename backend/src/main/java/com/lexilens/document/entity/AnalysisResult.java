package com.lexilens.document.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_results")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false, unique = true)
    private Document document;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "overall_risk_score")
    private Integer overallRiskScore;

    @Column(name = "overall_risk_level")
    private String overallRiskLevel;

    @Column(name = "key_findings", columnDefinition = "TEXT")
    private String keyFindings;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
