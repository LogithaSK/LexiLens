package com.lexilens.dashboard.controller;

import com.lexilens.auth.entity.User;
import com.lexilens.auth.repository.UserRepository;
import com.lexilens.common.exception.ResourceNotFoundException;
import com.lexilens.common.response.ApiResponse;
import com.lexilens.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard summary endpoints")
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    // JwtAuthenticationFilter places a UserDetails in the security context, so the
    // principal is never the User entity. Resolve the entity by username instead of
    // injecting it, otherwise this silently yields null and fails with a 500.
    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> summary = dashboardService.getDashboardSummary(getUserId(userDetails));
        return ResponseEntity.ok(ApiResponse.success(summary));
    }
}
