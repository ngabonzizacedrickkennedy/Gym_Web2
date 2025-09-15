package com.sheshape.service;

import com.sheshape.dto.profile.*;
import com.sheshape.exception.ResourceNotFoundException;
import com.sheshape.exception.BadRequestException;
import com.sheshape.model.User;
import com.sheshape.model.profile.*;
import com.sheshape.repository.UserRepository;
import com.sheshape.repository.profile.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProfileService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PhysicalAttributesRepository physicalAttributesRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final HealthInformationRepository healthInformationRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final FileStorageService fileStorageService;

    // CRITICAL: Profile picture directory for S3
    private static final String PROFILE_PICTURES_DIRECTORY = "profile-pictures/";

    @Transactional
    public ProfileResponseDTO setupProfile(Long userId, ProfileSetupRequestDTO request) {
        log.info("Setting up profile for user ID: {}", userId);

        try {
            User user = getUserById(userId);

            // CRITICAL FIX: Check if profile already exists
            Optional<Profile> existingProfile = profileRepository.findByUserId(userId);

            Profile profile;
            if (existingProfile.isPresent()) {
                // Update existing profile
                log.info("Profile already exists for user ID: {}, updating existing profile", userId);
                profile = updateExistingProfile(existingProfile.get(), request);
            } else {
                // Create new profile
                log.info("Creating new profile for user ID: {}", userId);
                profile = createNewProfile(user, request);
                profile = profileRepository.save(profile);
            }

            // Handle related entities (create or update)
            PhysicalAttributes physicalAttributes = handlePhysicalAttributes(userId, request);
            FitnessProfile fitnessProfile = handleFitnessProfile(userId, request);
            HealthInformation healthInformation = handleHealthInformation(userId, request);
            UserPreferences userPreferences = handleUserPreferences(userId, request);

            // Mark profile as completed and save user
            user.setProfileCompleted(true);
            userRepository.save(user);
            log.info("Profile setup completed successfully for user ID: {}", userId);

            return buildProfileResponse(user, profile, physicalAttributes, fitnessProfile,
                    healthInformation, userPreferences);

        } catch (Exception e) {
            log.error("Error during profile setup for user ID: {}", userId, e);
            throw new BadRequestException("Failed to save profile: " + e.getMessage());
        }
    }

    @Transactional
    public ProfileResponseDTO updateProfile(Long userId, ProfileUpdateRequestDTO request) {
        log.info("Updating profile for user ID: {}", userId);

        User user = getUserById(userId);
        Profile profile = updateProfile(user, request);

        PhysicalAttributes physicalAttributes = updatePhysicalAttributes(userId, request);
        FitnessProfile fitnessProfile = updateFitnessProfile(userId, request);
        HealthInformation healthInformation = updateHealthInformation(userId, request);
        UserPreferences userPreferences = updateUserPreferences(userId, request);

        return buildProfileResponse(user, profile, physicalAttributes, fitnessProfile,
                healthInformation, userPreferences);
    }

    // Add this complete method to your ProfileService.java class

    @Transactional
    public ProfilePictureResponseDTO uploadProfilePicture(Long userId, MultipartFile file) {
        log.info("Uploading profile picture for user ID: {}", userId);

        // Validate file
        validateProfilePictureFile(file);

        User user = getUserById(userId);

        // Get or create profile
        Profile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUser(user);
                    return profileRepository.save(newProfile);
                });

        // Delete old profile picture if exists
        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isEmpty()) {
            try {
                // Extract file key from URL to delete from S3
                String oldFileKey = extractFileKeyFromUrl(profile.getProfilePictureUrl());
                if (oldFileKey != null) {
                    fileStorageService.deleteFile(oldFileKey);
                    log.info("Deleted old profile picture for user ID: {}", userId);
                }
            } catch (Exception e) {
                log.warn("Failed to delete old profile picture for user ID: {}", userId, e);
                // Continue with upload even if delete fails
            }
        }

        try {
            // Upload new profile picture to S3
            String fileKey = fileStorageService.uploadFile(file, PROFILE_PICTURES_DIRECTORY);
            String fileUrl = fileStorageService.getFileUrl(fileKey);

            // Update profile with new picture URL
            profile.setProfilePictureUrl(fileUrl);
            profile = profileRepository.save(profile);

            log.info("Profile picture uploaded successfully for user ID: {} with URL: {}", userId, fileUrl);

            // CRITICAL FIX: Return the complete ProfilePictureResponseDTO
            return ProfilePictureResponseDTO.builder()
                    .profilePictureUrl(fileUrl)
                    .fileName(fileKey)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now().toString())
                    .build();

        } catch (Exception e) {
            log.error("Failed to upload profile picture for user ID: {}", userId, e);
            throw new BadRequestException("Failed to upload profile picture: " + e.getMessage());
        }
    }

    // Also add the missing extractFileKeyFromUrl method if it's not complete:
    private String extractFileKeyFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return null;
        }

        try {
            // Extract file key from S3 URL
            // Format: https://sheshape-gym.s3.eu-north-1.amazonaws.com/profile-pictures/filename
            String[] parts = fileUrl.split("/");
            if (parts.length >= 2) {
                // Get the directory and filename parts
                StringBuilder keyBuilder = new StringBuilder();
                boolean foundBucket = false;
                for (int i = 0; i < parts.length; i++) {
                    if (parts[i].contains("sheshape-gym") || parts[i].contains("s3")) {
                        foundBucket = true;
                        continue;
                    }
                    if (foundBucket) {
                        if (keyBuilder.length() > 0) {
                            keyBuilder.append("/");
                        }
                        keyBuilder.append(parts[i]);
                    }
                }
                return keyBuilder.toString();
            }
        } catch (Exception e) {
            log.warn("Failed to extract file key from URL: {}", fileUrl, e);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public ProfileResponseDTO getUserProfile(Long userId) {
        log.info("Retrieving profile for user ID: {}", userId);

        User user = getUserById(userId);
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        PhysicalAttributes physicalAttributes = physicalAttributesRepository.findByUserId(userId).orElse(null);
        FitnessProfile fitnessProfile = fitnessProfileRepository.findByUserId(userId).orElse(null);
        HealthInformation healthInformation = healthInformationRepository.findByUserId(userId).orElse(null);
        UserPreferences userPreferences = userPreferencesRepository.findByUserId(userId).orElse(null);

        return buildProfileResponse(user, profile, physicalAttributes, fitnessProfile,
                healthInformation, userPreferences);
    }

    @Transactional(readOnly = true)
    public UserProfileSummaryDTO getUserProfileSummary(Long userId) {
        log.info("Retrieving profile summary for user ID: {}", userId);

        User user = getUserById(userId);
        Profile profile = profileRepository.findByUserId(userId).orElse(null);
        FitnessProfile fitnessProfile = fitnessProfileRepository.findByUserId(userId).orElse(null);

        return UserProfileSummaryDTO.builder()
                .userId(user.getId())
                .firstName(profile != null ? profile.getFirstName() : null)
                .lastName(profile != null ? profile.getLastName() : null)
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .gender(profile != null ? profile.getGender() : null)
                .profilePictureUrl(profile != null ? profile.getProfilePictureUrl() : null)
                .fitnessLevel(fitnessProfile != null ? fitnessProfile.getFitnessLevel() : null)
                .primaryGoal(fitnessProfile != null ? fitnessProfile.getPrimaryGoal() : null)
                .profileCompleted(user.getProfileCompleted())
                .build();
    }

    // Helper methods
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private void validateProfilePictureFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Profile picture file cannot be empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed for profile pictures");
        }

        // Validate file size (5MB max)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new BadRequestException("Profile picture size cannot exceed 5MB");
        }

        // Validate image formats
        String[] allowedTypes = {"image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"};
        boolean validType = false;
        for (String type : allowedTypes) {
            if (type.equals(contentType)) {
                validType = true;
                break;
            }
        }

        if (!validType) {
            throw new BadRequestException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }
    }



    // CRITICAL FIX: Method to update existing profile
    private Profile updateExistingProfile(Profile existingProfile, ProfileSetupRequestDTO request) {
        if (request.getFirstName() != null) {
            existingProfile.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            existingProfile.setLastName(request.getLastName());
        }
        if (request.getDateOfBirth() != null) {
            existingProfile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            existingProfile.setGender(request.getGender());
        }
        if (request.getPhoneNumber() != null) {
            existingProfile.setPhoneNumber(request.getPhoneNumber());
        }

        return profileRepository.save(existingProfile);
    }

    // Profile creation
    private Profile createNewProfile(User user, ProfileSetupRequestDTO request) {
        Profile profile = new Profile();
        profile.setUser(user);
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        profile.setPhoneNumber(request.getPhoneNumber());
        return profile;
    }

    private Profile updateProfile(User user, ProfileUpdateRequestDTO request) {
        Profile profile = profileRepository.findByUserId(user.getId()).orElse(new Profile());
        profile.setUser(user);

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getGender() != null) profile.setGender(request.getGender());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());

        return profileRepository.save(profile);
    }

    // CRITICAL FIX: Handle physical attributes (create or update)
    private PhysicalAttributes handlePhysicalAttributes(Long userId, ProfileSetupRequestDTO request) {
        if (request.getHeightCm() == null && request.getCurrentWeightKg() == null && request.getTargetWeightKg() == null) {
            return null;
        }

        Optional<PhysicalAttributes> existing = physicalAttributesRepository.findByUserId(userId);
        PhysicalAttributes attributes;

        if (existing.isPresent()) {
            // Update existing
            attributes = existing.get();
            if (request.getHeightCm() != null) attributes.setHeightCm(request.getHeightCm());
            if (request.getCurrentWeightKg() != null) attributes.setCurrentWeightKg(request.getCurrentWeightKg());
            if (request.getTargetWeightKg() != null) attributes.setTargetWeightKg(request.getTargetWeightKg());
        } else {
            // Create new
            attributes = new PhysicalAttributes();
            attributes.setUserId(userId);
            attributes.setHeightCm(request.getHeightCm());
            attributes.setCurrentWeightKg(request.getCurrentWeightKg());
            attributes.setTargetWeightKg(request.getTargetWeightKg());
        }

        return physicalAttributesRepository.save(attributes);
    }

    private PhysicalAttributes updatePhysicalAttributes(Long userId, ProfileUpdateRequestDTO request) {
        PhysicalAttributes attributes = physicalAttributesRepository.findByUserId(userId).orElse(new PhysicalAttributes());
        attributes.setUserId(userId);

        if (request.getHeightCm() != null) attributes.setHeightCm(request.getHeightCm());
        if (request.getCurrentWeightKg() != null) attributes.setCurrentWeightKg(request.getCurrentWeightKg());
        if (request.getTargetWeightKg() != null) attributes.setTargetWeightKg(request.getTargetWeightKg());

        return physicalAttributesRepository.save(attributes);
    }

    // CRITICAL FIX: Handle fitness profile (create or update)
    private FitnessProfile handleFitnessProfile(Long userId, ProfileSetupRequestDTO request) {
        if (request.getFitnessLevel() == null && request.getPrimaryGoal() == null) {
            return null;
        }

        Optional<FitnessProfile> existing = fitnessProfileRepository.findByUserId(userId);
        FitnessProfile fitnessProfile;

        if (existing.isPresent()) {
            // Update existing
            fitnessProfile = existing.get();
            if (request.getFitnessLevel() != null) fitnessProfile.setFitnessLevel(request.getFitnessLevel());
            if (request.getPrimaryGoal() != null) fitnessProfile.setPrimaryGoal(request.getPrimaryGoal());
            if (request.getSecondaryGoals() != null) fitnessProfile.setSecondaryGoals(request.getSecondaryGoals());
            if (request.getPreferredActivityTypes() != null) fitnessProfile.setPreferredActivityTypes(request.getPreferredActivityTypes());
            if (request.getWorkoutFrequency() != null) fitnessProfile.setWorkoutFrequency(request.getWorkoutFrequency());
            if (request.getWorkoutDuration() != null) fitnessProfile.setWorkoutDuration(request.getWorkoutDuration());
            if (request.getPreferredWorkoutDays() != null) fitnessProfile.setPreferredWorkoutDays(request.getPreferredWorkoutDays());
            if (request.getPreferredWorkoutTimes() != null) fitnessProfile.setPreferredWorkoutTimes(request.getPreferredWorkoutTimes());
        } else {
            // Create new
            fitnessProfile = new FitnessProfile();
            fitnessProfile.setUserId(userId);
            fitnessProfile.setFitnessLevel(request.getFitnessLevel());
            fitnessProfile.setPrimaryGoal(request.getPrimaryGoal());
            fitnessProfile.setSecondaryGoals(request.getSecondaryGoals());
            fitnessProfile.setPreferredActivityTypes(request.getPreferredActivityTypes());
            fitnessProfile.setWorkoutFrequency(request.getWorkoutFrequency());
            fitnessProfile.setWorkoutDuration(request.getWorkoutDuration());
            fitnessProfile.setPreferredWorkoutDays(request.getPreferredWorkoutDays());
            fitnessProfile.setPreferredWorkoutTimes(request.getPreferredWorkoutTimes());
        }

        return fitnessProfileRepository.save(fitnessProfile);
    }

    private FitnessProfile updateFitnessProfile(Long userId, ProfileUpdateRequestDTO request) {
        FitnessProfile fitnessProfile = fitnessProfileRepository.findByUserId(userId).orElse(new FitnessProfile());
        fitnessProfile.setUserId(userId);

        if (request.getFitnessLevel() != null) fitnessProfile.setFitnessLevel(request.getFitnessLevel());
        if (request.getPrimaryGoal() != null) fitnessProfile.setPrimaryGoal(request.getPrimaryGoal());
        if (request.getSecondaryGoals() != null) fitnessProfile.setSecondaryGoals(request.getSecondaryGoals());
        if (request.getPreferredActivityTypes() != null) fitnessProfile.setPreferredActivityTypes(request.getPreferredActivityTypes());
        if (request.getWorkoutFrequency() != null) fitnessProfile.setWorkoutFrequency(request.getWorkoutFrequency());
        if (request.getWorkoutDuration() != null) fitnessProfile.setWorkoutDuration(request.getWorkoutDuration());
        if (request.getPreferredWorkoutDays() != null) fitnessProfile.setPreferredWorkoutDays(request.getPreferredWorkoutDays());
        if (request.getPreferredWorkoutTimes() != null) fitnessProfile.setPreferredWorkoutTimes(request.getPreferredWorkoutTimes());

        return fitnessProfileRepository.save(fitnessProfile);
    }

    // CRITICAL FIX: Handle health information (create or update)
    private HealthInformation handleHealthInformation(Long userId, ProfileSetupRequestDTO request) {
        if (request.getDietaryRestrictions() == null && request.getHealthConditions() == null &&
                request.getMedications() == null && request.getEmergencyContactName() == null &&
                request.getEmergencyContactPhone() == null) {
            return null;
        }

        Optional<HealthInformation> existing = healthInformationRepository.findByUserId(userId);
        HealthInformation healthInfo;

        if (existing.isPresent()) {
            // Update existing
            healthInfo = existing.get();
            if (request.getDietaryRestrictions() != null) healthInfo.setDietaryRestrictions(request.getDietaryRestrictions());
            if (request.getHealthConditions() != null) healthInfo.setHealthConditions(request.getHealthConditions());
            if (request.getMedications() != null) healthInfo.setMedications(request.getMedications());
            if (request.getEmergencyContactName() != null) healthInfo.setEmergencyContactName(request.getEmergencyContactName());
            if (request.getEmergencyContactPhone() != null) healthInfo.setEmergencyContactPhone(request.getEmergencyContactPhone());
        } else {
            // Create new
            healthInfo = new HealthInformation();
            healthInfo.setUserId(userId);
            healthInfo.setDietaryRestrictions(request.getDietaryRestrictions());
            healthInfo.setHealthConditions(request.getHealthConditions());
            healthInfo.setMedications(request.getMedications());
            healthInfo.setEmergencyContactName(request.getEmergencyContactName());
            healthInfo.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }

        return healthInformationRepository.save(healthInfo);
    }

    private HealthInformation updateHealthInformation(Long userId, ProfileUpdateRequestDTO request) {
        HealthInformation healthInfo = healthInformationRepository.findByUserId(userId).orElse(new HealthInformation());
        healthInfo.setUserId(userId);

        if (request.getDietaryRestrictions() != null) healthInfo.setDietaryRestrictions(request.getDietaryRestrictions());
        if (request.getHealthConditions() != null) healthInfo.setHealthConditions(request.getHealthConditions());
        if (request.getMedications() != null) healthInfo.setMedications(request.getMedications());
        if (request.getEmergencyContactName() != null) healthInfo.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) healthInfo.setEmergencyContactPhone(request.getEmergencyContactPhone());

        return healthInformationRepository.save(healthInfo);
    }

    // CRITICAL FIX: Handle user preferences (create or update)
    private UserPreferences handleUserPreferences(Long userId, ProfileSetupRequestDTO request) {
        Optional<UserPreferences> existing = userPreferencesRepository.findByUserId(userId);
        UserPreferences preferences;

        if (existing.isPresent()) {
            preferences = existing.get();
            if (request.getTimezone() != null) preferences.setTimezone(request.getTimezone());
            if (request.getLanguage() != null) preferences.setLanguage(request.getLanguage());
            // CRITICAL: Always ensure non-null values for NOT NULL columns
            preferences.setEmailNotifications(request.getEmailNotifications() != null ? request.getEmailNotifications() : true);
            preferences.setPushNotifications(request.getPushNotifications() != null ? request.getPushNotifications() : true);
            if (request.getPrivacyLevel() != null) preferences.setPrivacyLevel(request.getPrivacyLevel());
        } else {
            preferences = new UserPreferences();
            preferences.setUserId(userId);
            preferences.setTimezone(request.getTimezone());
            preferences.setLanguage(request.getLanguage() != null ? request.getLanguage() : "en");
            // CRITICAL: Always set non-null values for NOT NULL fields
            preferences.setEmailNotifications(request.getEmailNotifications() != null ? request.getEmailNotifications() : true);
            preferences.setPushNotifications(request.getPushNotifications() != null ? request.getPushNotifications() : true);
            preferences.setPrivacyLevel(request.getPrivacyLevel() != null ? request.getPrivacyLevel() : UserPreferences.PrivacyLevel.PRIVATE);
        }

        return userPreferencesRepository.save(preferences);
    }

    private UserPreferences updateUserPreferences(Long userId, ProfileUpdateRequestDTO request) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId).orElse(new UserPreferences());
        preferences.setUserId(userId);

        if (request.getTimezone() != null) preferences.setTimezone(request.getTimezone());
        if (request.getLanguage() != null) preferences.setLanguage(request.getLanguage());
        if (request.getEmailNotifications() != null) preferences.setEmailNotifications(request.getEmailNotifications());
        if (request.getPushNotifications() != null) preferences.setPushNotifications(request.getPushNotifications());
        if (request.getPrivacyLevel() != null) preferences.setPrivacyLevel(request.getPrivacyLevel());

        return userPreferencesRepository.save(preferences);
    }

    // Response building
    private ProfileResponseDTO buildProfileResponse(User user, Profile profile, PhysicalAttributes physicalAttributes,
                                                    FitnessProfile fitnessProfile, HealthInformation healthInformation,
                                                    UserPreferences userPreferences) {
        return ProfileResponseDTO.builder()
                // Profile completion status (this field exists in DTO)
                .profileCompleted(user.getProfileCompleted())

                // Profile info - using the correct ID field from DTO
                .id(profile != null ? profile.getId() : null)
                .firstName(profile != null ? profile.getFirstName() : null)
                .lastName(profile != null ? profile.getLastName() : null)
                .dateOfBirth(profile != null ? profile.getDateOfBirth() : null)
                .gender(profile != null ? profile.getGender() : null)
                .phoneNumber(profile != null ? profile.getPhoneNumber() : null)
                .profilePictureUrl(profile != null ? profile.getProfilePictureUrl() : null)

                // Physical attributes
                .heightCm(physicalAttributes != null ? physicalAttributes.getHeightCm() : null)
                .currentWeightKg(physicalAttributes != null ? physicalAttributes.getCurrentWeightKg() : null)
                .targetWeightKg(physicalAttributes != null ? physicalAttributes.getTargetWeightKg() : null)

                // Fitness profile
                .fitnessLevel(fitnessProfile != null ? fitnessProfile.getFitnessLevel() : null)
                .primaryGoal(fitnessProfile != null ? fitnessProfile.getPrimaryGoal() : null)
                .secondaryGoals(fitnessProfile != null ? fitnessProfile.getSecondaryGoals() : null)
                .preferredActivityTypes(fitnessProfile != null ? fitnessProfile.getPreferredActivityTypes() : null)
                .workoutFrequency(fitnessProfile != null ? fitnessProfile.getWorkoutFrequency() : null)
                .workoutDuration(fitnessProfile != null ? fitnessProfile.getWorkoutDuration() : null)
                .preferredWorkoutDays(fitnessProfile != null ? fitnessProfile.getPreferredWorkoutDays() : null)
                .preferredWorkoutTimes(fitnessProfile != null ? fitnessProfile.getPreferredWorkoutTimes() : null)

                // Health information
                .dietaryRestrictions(healthInformation != null ? healthInformation.getDietaryRestrictions() : null)
                .healthConditions(healthInformation != null ? healthInformation.getHealthConditions() : null)
                .medications(healthInformation != null ? healthInformation.getMedications() : null)
                .emergencyContactName(healthInformation != null ? healthInformation.getEmergencyContactName() : null)
                .emergencyContactPhone(healthInformation != null ? healthInformation.getEmergencyContactPhone() : null)

                // User preferences
                .timezone(userPreferences != null ? userPreferences.getTimezone() : null)
                .language(userPreferences != null ? userPreferences.getLanguage() : null)
                .emailNotifications(userPreferences != null ? userPreferences.getEmailNotifications() : null)
                .pushNotifications(userPreferences != null ? userPreferences.getPushNotifications() : null)
                .privacyLevel(userPreferences != null ? userPreferences.getPrivacyLevel() : null)

                // Metadata
                .createdAt(profile != null ? profile.getCreatedAt() : null)
                .updatedAt(profile != null ? profile.getUpdatedAt() : null)
                .build();
    }
    public void deleteProfilePicture(Long userId) {
        log.info("Deleting profile picture for user ID: {}", userId);

        User user = getUserById(userId);

        // Get profile
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user id: " + userId));

        String currentProfilePictureUrl = profile.getProfilePictureUrl();

        if (currentProfilePictureUrl != null && !currentProfilePictureUrl.isEmpty()) {
            try {
                // Extract file key from URL to delete from S3
                String fileKey = extractFileKeyFromUrl(currentProfilePictureUrl);
                if (fileKey != null) {
                    fileStorageService.deleteFile(fileKey);
                    log.info("Deleted profile picture file from S3 for user ID: {}", userId);
                }
            } catch (Exception e) {
                log.warn("Failed to delete profile picture file from S3 for user ID: {}", userId, e);
                // Continue with database update even if S3 delete fails
            }

            // Update profile in database - remove picture URL
            profile.setProfilePictureUrl(null);
            profileRepository.save(profile);

            log.info("Profile picture removed successfully for user ID: {}", userId);
        } else {
            log.info("No profile picture to delete for user ID: {}", userId);
        }
    }

    // Helper method to extract file key from S3 URL (add this too if it doesn't exist)

}