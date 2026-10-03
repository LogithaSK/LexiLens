package com.lexilens.extraction;

import com.lexilens.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
public class DocxExtractionService implements TextExtractionService {

    private final Tika tika = new Tika();

    @Override
    public String extractText(MultipartFile file) throws Exception {
        try (var inputStream = file.getInputStream()) {
            String text = tika.parseToString(inputStream);

            if (text == null || text.trim().isEmpty()) {
                throw new FileProcessingException("No text content found in DOCX file");
            }

            return text.trim();
        } catch (FileProcessingException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error extracting text from DOCX: {}", e.getMessage());
            throw new FileProcessingException("Failed to extract text from DOCX: " + e.getMessage());
        }
    }
}
