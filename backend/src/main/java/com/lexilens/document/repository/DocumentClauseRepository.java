package com.lexilens.document.repository;

import com.lexilens.document.entity.DocumentClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentClauseRepository extends JpaRepository<DocumentClause, Long> {
    List<DocumentClause> findByDocumentIdOrderByClauseNumber(Long documentId);
    List<DocumentClause> findByDocumentIdAndRiskLevelInOrderByRiskScoreDesc(Long documentId, List<String> riskLevels);
}
