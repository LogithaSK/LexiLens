package com.lexilens.document.repository;

import com.lexilens.document.entity.RiskAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAnalysisRepository extends JpaRepository<RiskAnalysis, Long> {
    List<RiskAnalysis> findByClauseId(Long clauseId);
    List<RiskAnalysis> findByClauseDocumentId(Long documentId);
}
