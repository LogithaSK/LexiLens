package com.lexilens.document.service;

import com.lexilens.analysis.DocumentAnalysisService;
import com.lexilens.common.exception.FileProcessingException;
import com.lexilens.common.exception.ResourceNotFoundException;
import com.lexilens.common.util.FileUtil;
import com.lexilens.document.dto.*;
import com.lexilens.document.entity.*;
import com.lexilens.document.repository.*;
import com.lexilens.extraction.TextExtractionServiceFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentClauseRepository clauseRepository;
    private final AnalysisResultRepository analysisResultRepository;
    private final RiskAnalysisRepository riskAnalysisRepository;
    private final TextExtractionServiceFactory extractionServiceFactory;
    private final DocumentAnalysisService analysisService;

    @Value("${file.storage.path:./uploads}")
    private String storagePath;

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, Long userId, com.lexilens.auth.entity.User user) {
        validateFile(file);

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            log.error("Could not read uploaded file", e);
            throw new FileProcessingException("Could not read uploaded file");
        }

        String originalFilename = file.getOriginalFilename();
        String safeFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileType = FileUtil.getExtension(originalFilename).toLowerCase();

        Path filePath = Paths.get(storagePath)
        .toAbsolutePath()
        .normalize()
        .resolve(safeFilename);
        try {
            Files.createDirectories(filePath.getParent());
            log.info("Saving uploaded file to: {}", filePath);
            Files.write(filePath, fileBytes);
            log.info("File saved successfully: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to save uploaded file. Target path: {}", filePath, e);
            throw new FileProcessingException("Failed to save file");
        }
        

        Document document = Document.builder()
                .user(user)
                .filename(safeFilename)
                .originalFilename(originalFilename)
                .fileType(fileType)
                .filePath(filePath.toString())
                .processingStatus(Document.ProcessingStatus.UPLOADED)
                .build();

        document = documentRepository.save(document);

        try {
            String text = extractionServiceFactory.extractText(file);
            document.setExtractedText(text);
            document.setProcessingStatus(Document.ProcessingStatus.EXTRACTED);
            documentRepository.save(document);
        } catch (Exception e) {
            log.error("Text extraction failed for document {}: {}", document.getId(), e.getMessage());
            document.setProcessingStatus(Document.ProcessingStatus.FAILED);
            documentRepository.save(document);
        }

        return mapToResponse(document);
    }

    @Async
    @Transactional
    public void triggerAnalysis(Long documentId) {
        analysisService.analyzeDocument(documentId);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDetailResponse getDocumentDetail(Long documentId, Long userId) {
        Document document = getDocumentIfOwned(documentId, userId);

        DocumentDetailResponse response = new DocumentDetailResponse();
        response.setId(document.getId());
        response.setFilename(document.getFilename());
        response.setOriginalFilename(document.getOriginalFilename());
        response.setFileType(document.getFileType());
        response.setDocumentType(document.getDocumentType());
        response.setProcessingStatus(document.getProcessingStatus().name());
        response.setUploadedAt(document.getUploadedAt());

        analysisResultRepository.findByDocumentId(documentId).ifPresent(result -> {
            response.setSummary(result.getSummary());
            response.setOverallRiskScore(result.getOverallRiskScore());
            response.setOverallRiskLevel(result.getOverallRiskLevel());
            response.setKeyFindings(result.getKeyFindings());
        });

        List<DocumentClause> clauses = clauseRepository.findByDocumentIdOrderByClauseNumber(documentId);
        response.setClauses(clauses.stream().map(this::mapClauseToResponse).collect(Collectors.toList()));

        List<RiskAnalysis> allRisks = riskAnalysisRepository.findByClauseDocumentId(documentId);
        response.setRisks(allRisks.stream().map(this::mapRiskToResponse).collect(Collectors.toList()));

        return response;
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        Document document = getDocumentIfOwned(documentId, userId);

        if (document.getFilePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(document.getFilePath()));
            } catch (IOException e) {
                log.warn("Could not delete file: {}", e.getMessage());
            }
        }

        documentRepository.delete(document);
    }

    @Transactional(readOnly = true)
    public Document getDocumentIfOwned(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (!document.getUser().getId().equals(userId)) {
            throw new com.lexilens.common.exception.ResourceNotFoundException("Document not found");
        }

        return document;
    }

    @Transactional(readOnly = true)
    public List<ClauseResponse> getClauses(Long documentId, Long userId) {
        getDocumentIfOwned(documentId, userId);
        return clauseRepository.findByDocumentIdOrderByClauseNumber(documentId).stream()
                .map(this::mapClauseToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RiskAnalysisResponse> getRisks(Long documentId, Long userId) {
        getDocumentIfOwned(documentId, userId);
        return riskAnalysisRepository.findByClauseDocumentId(documentId).stream()
                .map(this::mapRiskToResponse)
                .collect(Collectors.toList());
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileProcessingException("File is empty");
        }

        if (file.getSize() > 20 * 1024 * 1024) {
            throw new FileProcessingException("File size exceeds maximum limit of 20MB");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new FileProcessingException("Invalid filename");
        }

        if (!FileUtil.isAllowedType(file.getContentType(), filename)) {
            throw new FileProcessingException("Unsupported file format. Supported: PDF, DOCX, PNG, JPG");
        }
    }

    private DocumentResponse mapToResponse(Document doc) {
        DocumentResponse response = new DocumentResponse();
        response.setId(doc.getId());
        response.setFilename(doc.getFilename());
        response.setOriginalFilename(doc.getOriginalFilename());
        response.setFileType(doc.getFileType());
        response.setDocumentType(doc.getDocumentType());
        response.setProcessingStatus(doc.getProcessingStatus().name());
        response.setUploadedAt(doc.getUploadedAt());
        return response;
    }

    private ClauseResponse mapClauseToResponse(DocumentClause clause) {
        List<RiskAnalysis> risks = riskAnalysisRepository.findByClauseId(clause.getId());
        return ClauseResponse.builder()
                .id(clause.getId())
                .clauseNumber(clause.getClauseNumber())
                .title(clause.getTitle())
                .category(clause.getCategory())
                .originalText(clause.getOriginalText())
                .simplifiedText(clause.getSimplifiedText())
                .riskLevel(clause.getRiskLevel())
                .riskScore(clause.getRiskScore())
                .risks(risks.stream().map(this::mapRiskToResponse).collect(Collectors.toList()))
                .build();
    }

    private RiskAnalysisResponse mapRiskToResponse(RiskAnalysis risk) {
        return RiskAnalysisResponse.builder()
                .id(risk.getId())
                .riskType(risk.getRiskType())
                .riskScore(risk.getRiskScore())
                .reason(risk.getReason())
                .financialImpact(risk.getFinancialImpact())
                .recommendation(risk.getRecommendation())
                .build();
    }
}
