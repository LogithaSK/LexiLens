package com.lexilens.document.controller;

import com.lexilens.auth.entity.User;
import com.lexilens.auth.repository.UserRepository;
import com.lexilens.common.exception.ResourceNotFoundException;
import com.lexilens.common.response.ApiResponse;
import com.lexilens.document.dto.*;
import com.lexilens.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Document management endpoints")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @PostMapping("/upload")
    @Operation(summary = "Upload a legal document")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        DocumentResponse response = documentService.uploadDocument(file, user.getId(), user);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all user documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> listDocuments(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<DocumentResponse> documents = documentService.getUserDocuments(userId);
        return ResponseEntity.ok(ApiResponse.success(documents));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document details with analysis")
    public ResponseEntity<ApiResponse<DocumentDetailResponse>> getDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DocumentDetailResponse response = documentService.getDocumentDetail(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/analyze")
    @Operation(summary = "Trigger document analysis")
    public ResponseEntity<ApiResponse<String>> analyzeDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        documentService.getDocumentIfOwned(id, userId);
        documentService.triggerAnalysis(id);
        return ResponseEntity.ok(ApiResponse.success("Analysis started", "PROCESSING"));
    }

    @GetMapping("/{id}/clauses")
    @Operation(summary = "Get document clauses")
    public ResponseEntity<ApiResponse<List<ClauseResponse>>> getClauses(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ClauseResponse> clauses = documentService.getClauses(id, userId);
        return ResponseEntity.ok(ApiResponse.success(clauses));
    }

    @GetMapping("/{id}/risks")
    @Operation(summary = "Get document risk analyses")
    public ResponseEntity<ApiResponse<List<RiskAnalysisResponse>>> getRisks(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<RiskAnalysisResponse> risks = documentService.getRisks(id, userId);
        return ResponseEntity.ok(ApiResponse.success(risks));
    }

    @GetMapping("/{id}/analysis")
    @Operation(summary = "Get document analysis results")
    public ResponseEntity<ApiResponse<DocumentDetailResponse>> getAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DocumentDetailResponse response = documentService.getDocumentDetail(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        documentService.deleteDocument(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted", null));
    }
}
