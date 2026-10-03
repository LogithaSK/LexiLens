package com.lexilens.ai;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class GeminiPromptService {

    public String classifyDocument(String text) {
        String truncated = truncateText(text, 8000);
        return """
            Analyze the following legal document and classify its type.

            Return ONLY a JSON object with these fields:
            - "documentType": one of RENTAL_AGREEMENT, LOAN_AGREEMENT, EMPLOYMENT_CONTRACT, INSURANCE_POLICY, TERMS_AND_CONDITIONS, SERVICE_AGREEMENT, OTHER
            - "confidence": a number between 0 and 1

            Do not add any explanation outside the JSON.
            Do not invent information not present in the document.

            Document text:
            """ + truncated;
    }

    public String summarizeDocument(String text, String documentType) {
        String truncated = truncateText(text, 10000);
        return """
            You are a legal document analysis assistant. Analyze the following %s document.

            Generate a comprehensive summary including:
            1. Main purpose of the document
            2. Important obligations for all parties
            3. Payment information (amounts, schedules)
            4. Contract duration and key dates
            5. Termination conditions
            6. Major risks identified
            7. Key financial obligations

            IMPORTANT: Only include information that is explicitly stated in the document.
            Do not invent or assume any information.

            Document text:
            %s
            """.formatted(documentType, truncated);
    }

    public String extractClauses(String text) {
        String truncated = truncateText(text, 12000);
        return """
            Break the following legal document into individual clauses or sections.

            Return ONLY a JSON array where each element has:
            - "clauseNumber": integer starting from 1
            - "title": short descriptive title
            - "category": one of PAYMENT, TERMINATION, LIABILITY, PENALTY, RENEWAL, CONFIDENTIALITY, DISPUTE_RESOLUTION, OBLIGATION, NOTICE, INSURANCE, INTELLECTLECTUAL_PROPERTY, OTHER
            - "originalText": the full text of this clause

            Return ONLY the JSON array. No explanation outside JSON.
            Include all significant clauses, skipping only pure formatting/preamble text.

            Document text:
            """ + truncated;
    }

    public String simplifyClause(String clauseText, String clauseTitle) {
        return """
            Simplify the following legal clause into plain English.

            For this clause titled "%s", provide:
            1. "simplifiedText": plain English explanation of what the clause says
            2. "whatThisMeans": practical explanation of what this means for the reader

            Return ONLY a JSON object with these two fields.
            Do not change the legal meaning.
            Do not invent obligations not present in the original.

            Original clause:
            %s
            """.formatted(clauseTitle, clauseText);
    }

    public String analyzeClauseRisk(String clauseText, String clauseTitle, String clauseCategory) {
        String truncated = truncateText(clauseText, 4000);
        return """
            Analyze the legal risk of the following clause from a %s document.

            Clause title: "%s"
            Category: %s

            Return ONLY a JSON object with:
            - "riskType": specific risk type (e.g., UNFAIR_TERMS, EXCESSIVE_PENALTY, HIDDEN_FEES, TERMINATION_RISK, LIABILITY_RISK, etc.)
            - "riskLevel": LOW, MEDIUM, HIGH, or CRITICAL
            - "riskScore": integer 0-100
            - "reason": explanation of why this is risky
            - "financialImpact": potential financial impact if any, or null
            - "recommendation": what the reader should do about this

            Base your analysis ONLY on the text present. Do not invent risks.

            Clause text:
            %s
            """.formatted(clauseCategory, clauseTitle, clauseCategory, truncated);
    }

    public String generateRecommendation(String clauseText, String riskType, String riskLevel) {
        return """
            Provide a practical recommendation for the following legal clause.

            Risk type: %s
            Risk level: %s

            Clause: "%s"

            Return ONLY a JSON object with:
            - "recommendation": specific actionable advice
            - "shouldSeekLegalAdvice": boolean
            - "keyQuestionToAsk": a question the reader could ask the other party

            Base recommendations only on what is in the clause.

            Clause text:
            %s
            """.formatted(riskType, riskLevel, truncateText(clauseText, 3000), clauseText);
    }

    public String generateKeyFindings(String summary, List<Map<String, Object>> highRiskClauses) {
        String riskInfo = highRiskClauses.stream()
                .map(c -> "Clause \"" + c.get("title") + "\" - Risk: " + c.get("riskLevel") + " (Score: " + c.get("riskScore") + ")")
                .reduce((a, b) -> a + "\n" + b)
                .orElse("None identified");

        return """
            Based on the document summary and high-risk clauses, provide key findings.

            Summary: %s

            High-risk clauses:
            %s

            Return ONLY a JSON array of strings, each being a key finding.
            Limit to 5 most important findings.
            """.formatted(truncateText(summary, 4000), riskInfo);
    }

    public String chatAboutDocument(String documentContext, String question, String documentType) {
        String truncatedContext = truncateText(documentContext, 10000);
        return """
            You are LexiLens, a legal document assistant. You answer questions about a specific document.
            You MUST only answer based on the document content provided below.
            Do NOT use general legal knowledge that is not supported by the document.
            If you are unsure or the document does not contain information to answer, say so.

            Document type: %s

            Document content (relevant sections):
            %s

            User question: %s

            Return ONLY a JSON object with:
            - "answer": your answer based ONLY on the document
            - "referencedClauses": array of clause numbers or section titles referenced
            - "confidence": HIGH, MEDIUM, or LOW based on how well the document supports your answer

            If the document does not contain enough information to answer, state that clearly.
            Do not provide general legal advice. Only reference what is in the document.
            """.formatted(documentType, truncatedContext, question);
    }

    public String translateText(String text, String targetLanguage) {
        return """
            Translate the following text into %s.
            Preserve the meaning and tone.
            Keep any legal terminology accurate.
            Do not translate proper nouns or legal clause references.

            Text to translate:
            %s
            """.formatted(targetLanguage, text);
    }

    private String truncateText(String text, int maxLength) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "\n[...document truncated for processing...]";
    }
}
