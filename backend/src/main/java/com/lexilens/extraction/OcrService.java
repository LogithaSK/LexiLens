package com.lexilens.extraction;

import com.lexilens.common.exception.FileProcessingException;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.InputStream;

@Slf4j
@Service
public class OcrService implements TextExtractionService {

    @Override
    public String extractText(MultipartFile file) throws Exception {
        try {
            ITesseract tesseract = new Tesseract();
            tesseract.setDatapath(System.getenv().getOrDefault("TESSDATA_PATH", "./tessdata"));
            tesseract.setLanguage("eng");

            try (InputStream is = file.getInputStream()) {
                BufferedImage image = ImageIO.read(is);
                if (image == null) {
                    throw new FileProcessingException("Could not read image file for OCR");
                }
                String text = tesseract.doOCR(image);

                if (text == null || text.trim().isEmpty()) {
                    throw new FileProcessingException("No text could be extracted from the image");
                }

                return text.trim();
            }
        } catch (TesseractException e) {
            log.error("OCR processing failed: {}", e.getMessage());
            throw new FileProcessingException("OCR processing failed: " + e.getMessage());
        } catch (FileProcessingException e) {
            throw e;
        }
    }
}
