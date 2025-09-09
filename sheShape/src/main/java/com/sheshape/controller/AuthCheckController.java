package com.sheshape.controller;

import com.sheshape.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthCheckController {

    private final UserService userService;

    /**
     * Check if user is authenticated
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuthentication(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() &&
                !authentication.getPrincipal().equals("anonymousUser")) {

            try {
                var currentUser = userService.getCurrentUser();
                return ResponseEntity.ok(Map.of(
                        "authenticated", true,
                        "user", Map.of(
                                "id", currentUser.getId(),
                                "email", currentUser.getEmail(),
                                "username", currentUser.getUsername(),
                                "role", currentUser.getRole().name() // Fixed: Added .name() to convert enum to string
                        )
                ));
            } catch (Exception e) {
                return ResponseEntity.ok(Map.of("authenticated", false));
            }
        }

        return ResponseEntity.ok(Map.of("authenticated", false));
    }
}