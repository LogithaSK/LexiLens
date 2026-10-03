package com.lexilens.extraction;

import org.springframework.web.multipart.MultipartFile;

public interface TextExtractionService {
    String extractText(MultipartFile file) throws Exception;
}
