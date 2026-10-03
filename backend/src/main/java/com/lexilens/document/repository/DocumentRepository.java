package com.lexilens.document.repository;

import com.lexilens.document.entity.Document;
import com.lexilens.document.entity.Document.ProcessingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByUploadedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByUserIdAndProcessingStatus(Long userId, ProcessingStatus status);
}
