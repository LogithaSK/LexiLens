package com.lexilens.classification;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassificationResult {
    private String documentType;
    private double confidence;
}
