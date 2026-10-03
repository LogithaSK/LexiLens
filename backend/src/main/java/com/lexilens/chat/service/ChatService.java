package com.lexilens.chat.service;

import com.lexilens.ai.AIResponseParser;
import com.lexilens.ai.GeminiPromptService;
import com.lexilens.ai.GeminiService;
import com.lexilens.auth.entity.User;
import com.lexilens.chat.entity.ChatMessage;
import com.lexilens.chat.repository.ChatRepository;
import com.lexilens.common.exception.ResourceNotFoundException;
import com.lexilens.document.entity.Document;
import com.lexilens.document.entity.DocumentClause;
import com.lexilens.document.repository.DocumentClauseRepository;
import com.lexilens.document.repository.DocumentRepository;
import com.lexilens.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final GeminiService geminiService;
    private final GeminiPromptService promptService;
    private final AIResponseParser responseParser;
    private final ChatRepository chatRepository;
    private final DocumentRepository documentRepository;
    private final DocumentClauseRepository clauseRepository;
    private final DocumentService documentService;

    @Transactional
    public Map<String, Object> askQuestion(Long documentId, String question, Long userId) {
        Document document = documentService.getDocumentIfOwned(documentId, userId);

        String documentContext = buildDocumentContext(document);
        String documentType = document.getDocumentType() != null ? document.getDocumentType() : "Legal Document";

        String answer;
        List<String> referencedClauses = new ArrayList<>();
        String confidence = "MEDIUM";
        String disclaimer = "LexiLens AI provides informational assistance for understanding legal documents. " +
                "It does not provide legal advice and does not replace consultation with a qualified legal professional.";

        if (geminiService.isAvailable()) {
            try {
                String prompt = promptService.chatAboutDocument(documentContext, question, documentType);
                String response = geminiService.generateContent(prompt);
                Map<String, Object> parsed = responseParser.parseJson(response);

                answer = responseParser.getField(parsed, "answer", response);
                confidence = responseParser.getField(parsed, "confidence", "MEDIUM");

                Object refs = parsed.get("referencedClauses");
                if (refs instanceof List) {
                    referencedClauses = ((List<?>) refs).stream()
                            .map(Object::toString)
                            .collect(Collectors.toList());
                }
            } catch (Exception e) {
                log.error("Chat AI failed: {}", e.getMessage());
                answer = "I'm sorry, the AI service is temporarily unavailable. Please try again later. " +
                        "Your question was about the document, but I cannot provide an answer at this time.";
                confidence = "LOW";
            }
        } else {
            answer = "The AI service is currently unavailable. Please try again later.";
            confidence = "LOW";
        }

        ChatMessage chatMessage = ChatMessage.builder()
                .user(User.builder().id(userId).build())
                .document(Document.builder().id(documentId).build())
                .question(question)
                .answer(answer)
                .referencedClauses(String.join(",", referencedClauses))
                .confidence(confidence)
                .build();

        chatRepository.save(chatMessage);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("answer", answer);
        result.put("referencedClauses", referencedClauses);
        result.put("confidence", confidence);
        result.put("disclaimer", disclaimer);

        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getChatHistory(Long documentId, Long userId) {
        documentService.getDocumentIfOwned(documentId, userId);
        return chatRepository.findByUserIdAndDocumentIdOrderByCreatedAtDesc(userId, documentId).stream()
                .map(msg -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", msg.getId());
                    map.put("question", msg.getQuestion());
                    map.put("answer", msg.getAnswer());
                    map.put("referencedClauses", msg.getReferencedClauses());
                    map.put("confidence", msg.getConfidence());
                    map.put("createdAt", msg.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private String buildDocumentContext(Document document) {
        List<DocumentClause> clauses = clauseRepository.findByDocumentIdOrderByClauseNumber(document.getId());

        StringBuilder context = new StringBuilder();
        context.append("Document Type: ").append(document.getDocumentType()).append("\n\n");

        for (DocumentClause clause : clauses) {
            context.append("Clause ").append(clause.getClauseNumber())
                    .append(" - ").append(clause.getTitle()).append(":\n");
            context.append(clause.getOriginalText()).append("\n\n");
        }

        return context.toString();
    }
}
