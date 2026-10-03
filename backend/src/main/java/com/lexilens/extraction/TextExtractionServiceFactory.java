package com.lexilens.extraction;

import com.lexilens.common.exception.FileProcessingException;
import com.lexilens.common.util.FileUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextExtractionServiceFactory {

    private final PdfExtractionService pdfExtractionService;
    private final DocxExtractionService docxExtractionService;
    private final OcrService ocrService;

    public String extractText(MultipartFile file) {
        String filename = file.getOriginalFilename();
        String ext = FileUtil.getExtension(filename).toLowerCase();

        try {
            return switch (ext) {
                case "pdf" -> extractFromPdf(file);
                case "docx" -> docxExtractionService.extractText(file);
                case "png", "jpg", "jpeg" -> ocrService.extractText(file);
                default -> throw new FileProcessingException("Unsupported file type: " + ext);
            };
        } catch (FileProcessingException e) {
            throw e;
        } catch (Exception e) {
            throw new FileProcessingException("Text extraction failed: " + e.getMessage());
        }
    }

    private String extractFromPdf(MultipartFile file) {
        try {
            return pdfExtractionService.extractText(file);
        } catch (FileProcessingException e) {
            if (e.getMessage() != null && e.getMessage().contains("scanned")) {
                log.info("PDF has no text, attempting OCR fallback");
                try {
                    return ocrService.extractText(file);
                } catch (Exception ocrEx) {
                    throw new FileProcessingException("OCR fallback also failed: " + ocrEx.getMessage());
                }
            }
            throw e;
        } catch (Exception e) {
            throw new FileProcessingException("PDF extraction failed: " + e.getMessage());
        }
    }
}
