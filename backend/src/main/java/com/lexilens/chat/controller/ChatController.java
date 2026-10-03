package com.lexilens.chat.controller;

import com.lexilens.auth.entity.User;
import com.lexilens.auth.repository.UserRepository;
import com.lexilens.chat.service.ChatService;
import com.lexilens.common.exception.ResourceNotFoundException;
import com.lexilens.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "AI Chat", description = "Document-grounded AI chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    // JwtAuthenticationFilter places a UserDetails in the security context, so the
    // principal is never the User entity. Resolve the entity by username instead of
    // injecting it, otherwise this silently yields null and fails with a 500.
    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @PostMapping
    @Operation(summary = "Ask a question about a document")
    public ResponseEntity<ApiResponse<Map<String, Object>>> askQuestion(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> response = chatService.askQuestion(
                request.getDocumentId(), request.getQuestion(), getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history/{documentId}")
    @Operation(summary = "Get chat history for a document")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHistory(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Map<String, Object>> history = chatService.getChatHistory(documentId, getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @Data
    public static class ChatRequest {
        private Long documentId;
        @NotBlank(message = "Question is required")
        private String question;
    }
}
