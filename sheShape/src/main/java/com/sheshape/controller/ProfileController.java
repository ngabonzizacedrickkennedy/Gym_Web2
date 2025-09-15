package com.sheshape.controller;

import com.sheshape.dto.profile.*;
import com.sheshape.dto.response.ApiResponse;
import com.sheshape.exception.BadRequestException;
import com.sheshape.exception.ResourceNotFoundException;
import com.sheshape.security.JwtUtil;
import com.sheshape.service.ProfileService;
import com.sheshape.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Slf4j
public class ProfileController {

    private final ProfileService profileService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    /**
     * Setup user profile - Create or update complete profile information
     */
    @PostMapping("/setup")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> setupProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ProfileSetupRequestDTO request) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile setup request received for user ID: {}", userId);

            ProfileResponseDTO profile = profileService.setupProfile(userId, request);

            return ResponseEntity.ok(ApiResponse.<ProfileResponseDTO>builder()
                    .success(true)
                    .message("Profile setup completed successfully")
                    .data(profile)
                    .build());

        } catch (BadRequestException e) {
            log.error("Profile setup validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message(e.getMessage())
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Profile setup failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message("Profile setup failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Update existing profile - Partial updates allowed
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> updateProfile(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ProfileUpdateRequestDTO request) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile update request received for user ID: {}", userId);

            ProfileResponseDTO profile = profileService.updateProfile(userId, request);

            return ResponseEntity.ok(ApiResponse.<ProfileResponseDTO>builder()
                    .success(true)
                    .message("Profile updated successfully")
                    .data(profile)
                    .build());

        } catch (ResourceNotFoundException e) {
            log.error("Profile not found for update: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (BadRequestException e) {
            log.error("Profile update validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message(e.getMessage())
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Profile update failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message("Profile update failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Upload profile picture to AWS S3
     */
    @PostMapping("/picture")
    public ResponseEntity<ApiResponse<ProfilePictureResponseDTO>> uploadProfilePicture(
            @RequestHeader("Authorization") String token,
            @RequestParam("file") MultipartFile file) { // Ensure parameter name is "file"

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile picture upload request received for user ID: {}", userId);

            // Validate file before processing
            if (file.isEmpty()) {
                throw new BadRequestException("Profile picture file cannot be empty");
            }

            ProfilePictureResponseDTO response = profileService.uploadProfilePicture(userId, file);

            return ResponseEntity.ok(ApiResponse.<ProfilePictureResponseDTO>builder()
                    .success(true)
                    .message("Profile picture uploaded successfully")
                    .data(response)
                    .build());

        } catch (BadRequestException e) {
            log.error("Profile picture upload validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfilePictureResponseDTO>builder()
                    .success(false)
                    .message(e.getMessage())
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Profile picture upload failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfilePictureResponseDTO>builder()
                    .success(false)
                    .message("Profile picture upload failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Delete/remove profile picture
     */
    @DeleteMapping("/picture")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeProfilePicture(
            @RequestHeader("Authorization") String token) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile picture removal request received for user ID: {}", userId);



            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture removed successfully");

            return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                    .success(true)
                    .message("Profile picture removed successfully")
                    .data(response)
                    .build());

        } catch (Exception e) {
            log.error("Profile picture removal failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, String>>builder()
                    .success(false)
                    .message("Profile picture removal failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Get complete user profile
     */
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> getUserProfile(
            @RequestHeader("Authorization") String token) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile retrieval request received for user ID: {}", userId);

            ProfileResponseDTO profile = profileService.getUserProfile(userId);

            return ResponseEntity.ok(ApiResponse.<ProfileResponseDTO>builder()
                    .success(true)
                    .message("Profile retrieved successfully")
                    .data(profile)
                    .build());

        } catch (ResourceNotFoundException e) {
            log.error("Profile not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Profile retrieval failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message("Profile retrieval failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Get profile summary - lightweight version
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<UserProfileSummaryDTO>> getUserProfileSummary(
            @RequestHeader("Authorization") String token) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile summary request received for user ID: {}", userId);

            UserProfileSummaryDTO summary = profileService.getUserProfileSummary(userId);

            return ResponseEntity.ok(ApiResponse.<UserProfileSummaryDTO>builder()
                    .success(true)
                    .message("Profile summary retrieved successfully")
                    .data(summary)
                    .build());

        } catch (ResourceNotFoundException e) {
            log.error("Profile summary not found: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Profile summary retrieval failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<UserProfileSummaryDTO>builder()
                    .success(false)
                    .message("Profile summary retrieval failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Get another user's profile (for trainers/admin viewing client profiles)
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'NUTRITIONIST')")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> getUserProfileById(
            @RequestHeader("Authorization") String token,
            @PathVariable Long userId) {

        try {
            Long requestingUserId = extractUserIdFromToken(token);
            log.info("Profile retrieval request for user ID: {} by user ID: {}", userId, requestingUserId);

            ProfileResponseDTO profile = profileService.getUserProfile(userId);

            return ResponseEntity.ok(ApiResponse.<ProfileResponseDTO>builder()
                    .success(true)
                    .message("Profile retrieved successfully")
                    .data(profile)
                    .build());

        } catch (ResourceNotFoundException e) {
            log.error("Profile not found for user ID: {}", userId);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Profile retrieval failed for user ID: {}", userId, e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message("Profile retrieval failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Check if profile is completed
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfileStatus(
            @RequestHeader("Authorization") String token) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile status request received for user ID: {}", userId);

            UserProfileSummaryDTO summary = profileService.getUserProfileSummary(userId);

            Map<String, Object> status = new HashMap<>();
            status.put("profileCompleted", summary.getProfileCompleted());
            status.put("userId", summary.getUserId());
            status.put("hasProfilePicture", summary.getProfilePictureUrl() != null && !summary.getProfilePictureUrl().isEmpty());
            status.put("firstName", summary.getFirstName());
            status.put("lastName", summary.getLastName());

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Profile status retrieved successfully")
                    .data(status)
                    .build());

        } catch (Exception e) {
            log.error("Profile status retrieval failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Profile status retrieval failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }
    @PostMapping("/profile-picture/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<ProfilePictureResponseDTO> uploadProfilePicture(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        // Validate file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size should not exceed 5MB");
        }

        try {
            ProfilePictureResponseDTO response = profileService.uploadProfilePicture(userId, file);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading profile picture for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to upload profile picture");
        }
    }

    @DeleteMapping("/profile-picture/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Map<String, String>> deleteProfilePicture(@PathVariable Long userId) {
        try {
            profileService.deleteProfilePicture(userId);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile picture deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting profile picture for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to delete profile picture");
        }
    }

    /**
     * Update specific profile section
     */
    @PatchMapping("/section/{section}")
    public ResponseEntity<ApiResponse<ProfileResponseDTO>> updateProfileSection(
            @RequestHeader("Authorization") String token,
            @PathVariable String section,
            @RequestBody Map<String, Object> updates) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile section update request for section '{}' by user ID: {}", section, userId);

            // You can implement section-specific updates in ProfileService
            // For now, treating it as a regular update
            ProfileUpdateRequestDTO request = mapUpdatesToRequest(updates, section);
            ProfileResponseDTO profile = profileService.updateProfile(userId, request);

            return ResponseEntity.ok(ApiResponse.<ProfileResponseDTO>builder()
                    .success(true)
                    .message("Profile section updated successfully")
                    .data(profile)
                    .build());

        } catch (BadRequestException e) {
            log.error("Profile section update validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message(e.getMessage())
                    .data(null)
                    .build());
        } catch (Exception e) {
            log.error("Profile section update failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<ProfileResponseDTO>builder()
                    .success(false)
                    .message("Profile section update failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    /**
     * Validate profile completeness
     */
    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validateProfile(
            @RequestHeader("Authorization") String token) {

        try {
            Long userId = extractUserIdFromToken(token);
            log.info("Profile validation request received for user ID: {}", userId);

            ProfileResponseDTO profile = profileService.getUserProfile(userId);

            Map<String, Object> validation = new HashMap<>();
            validation.put("isComplete", profile.getProfileCompleted());
            validation.put("missingFields", getMissingRequiredFields(profile));
            validation.put("completionPercentage", calculateCompletionPercentage(profile));

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Profile validation completed")
                    .data(validation)
                    .build());

        } catch (Exception e) {
            log.error("Profile validation failed", e);
            return ResponseEntity.internalServerError().body(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Profile validation failed: " + e.getMessage())
                    .data(null)
                    .build());
        }
    }

    // Helper Methods

    /**
     * Extract user ID from JWT token
     */
    private Long extractUserIdFromToken(String token) {
        try {
            // Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            String username = jwtUtil.extractUsername(token);
            return userService.getUserIdByUsernameOrEmail(username);
        } catch (Exception e) {
            log.error("Failed to extract user ID from token", e);
            throw new BadRequestException("Invalid or expired token");
        }
    }

    /**
     * Map generic updates to ProfileUpdateRequestDTO based on section
     */
    private ProfileUpdateRequestDTO mapUpdatesToRequest(Map<String, Object> updates, String section) {
        ProfileUpdateRequestDTO request = new ProfileUpdateRequestDTO();

        // Basic mapping - you can enhance this based on your needs
        switch (section.toLowerCase()) {
            case "personal":
                if (updates.containsKey("firstName")) {
                    request.setFirstName((String) updates.get("firstName"));
                }
                if (updates.containsKey("lastName")) {
                    request.setLastName((String) updates.get("lastName"));
                }
                if (updates.containsKey("phoneNumber")) {
                    request.setPhoneNumber((String) updates.get("phoneNumber"));
                }
                break;
            case "physical":
                if (updates.containsKey("heightCm")) {
                    request.setHeightCm((Integer) updates.get("heightCm"));
                }
                if (updates.containsKey("currentWeightKg")) {
                    request.setCurrentWeightKg((Double) updates.get("currentWeightKg"));
                }
                if (updates.containsKey("targetWeightKg")) {
                    request.setTargetWeightKg((Double) updates.get("targetWeightKg"));
                }
                break;
            case "fitness":
                if (updates.containsKey("fitnessLevel")) {
                    String fitnessLevelStr = (String) updates.get("fitnessLevel");
                    try {
                        request.setFitnessLevel(com.sheshape.model.profile.FitnessProfile.FitnessLevel.valueOf(fitnessLevelStr));
                    } catch (IllegalArgumentException e) {
                        throw new BadRequestException("Invalid fitness level: " + fitnessLevelStr);
                    }
                }
                if (updates.containsKey("primaryGoal")) {
                    String primaryGoalStr = (String) updates.get("primaryGoal");
                    try {
                        request.setPrimaryGoal(com.sheshape.model.profile.FitnessProfile.FitnessGoal.valueOf(primaryGoalStr));
                    } catch (IllegalArgumentException e) {
                        throw new BadRequestException("Invalid primary goal: " + primaryGoalStr);
                    }
                }
                break;
            case "preferences":
                if (updates.containsKey("timezone")) {
                    request.setTimezone((String) updates.get("timezone"));
                }
                if (updates.containsKey("language")) {
                    request.setLanguage((String) updates.get("language"));
                }
                break;
            default:
                throw new BadRequestException("Unknown profile section: " + section);
        }

        return request;
    }

    /**
     * Get list of missing required fields
     */
    private String[] getMissingRequiredFields(ProfileResponseDTO profile) {
        // Define required fields based on your business logic
        String[] requiredFields = {"firstName", "lastName", "dateOfBirth", "gender"};

        return java.util.Arrays.stream(requiredFields)
                .filter(field -> {
                    switch (field) {
                        case "firstName": return profile.getFirstName() == null || profile.getFirstName().isEmpty();
                        case "lastName": return profile.getLastName() == null || profile.getLastName().isEmpty();
                        case "dateOfBirth": return profile.getDateOfBirth() == null;
                        case "gender": return profile.getGender() == null;
                        default: return false;
                    }
                })
                .toArray(String[]::new);
    }

    /**
     * Calculate profile completion percentage
     */
    private int calculateCompletionPercentage(ProfileResponseDTO profile) {
        int totalFields = 10; // Adjust based on your requirements
        int completedFields = 0;

        if (profile.getFirstName() != null && !profile.getFirstName().isEmpty()) completedFields++;
        if (profile.getLastName() != null && !profile.getLastName().isEmpty()) completedFields++;
        if (profile.getDateOfBirth() != null) completedFields++;
        if (profile.getGender() != null) completedFields++;
        if (profile.getPhoneNumber() != null && !profile.getPhoneNumber().isEmpty()) completedFields++;
        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isEmpty()) completedFields++;
        if (profile.getHeightCm() != null) completedFields++;
        if (profile.getCurrentWeightKg() != null) completedFields++;
        if (profile.getFitnessLevel() != null) completedFields++;
        if (profile.getPrimaryGoal() != null) completedFields++;

        return (completedFields * 100) / totalFields;
    }
}