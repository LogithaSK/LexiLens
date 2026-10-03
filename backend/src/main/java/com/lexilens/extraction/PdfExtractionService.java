package com.lexilens.extraction;

import com.lexilens.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class PdfExtractionService implements TextExtractionService {

    @Override
    public String extractText(MultipartFile file) throws Exception {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                log.warn("No text extracted from PDF, it may be a scanned document: {}",
                        file.getOriginalFilename());
                throw new FileProcessingException("PDF appears to be scanned. OCR processing is required.");
            }

            return text.trim();
        } catch (FileProcessingException e) {
            throw e;
        } catch (Exception e) {
            log.error(
                "Error extracting text from PDF: {}",
                file.getOriginalFilename(),
                e
            );
        throw new FileProcessingException(
            "Failed to extract text from PDF: " + e.getMessage()
        );
}
    }
}
