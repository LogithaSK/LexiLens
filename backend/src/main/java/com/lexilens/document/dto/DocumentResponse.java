package com.lexilens.document.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private Long id;
    private String filename;
    private String originalFilename;
    private String fileType;
    private String documentType;
    private String processingStatus;
    private LocalDateTime uploadedAt;
}
