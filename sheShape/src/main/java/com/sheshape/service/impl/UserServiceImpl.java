package com.sheshape.service.impl;

import com.sheshape.dto.UserDto;
import com.sheshape.dto.response.CreateUserRequest;
import com.sheshape.exception.BadRequestException;
import com.sheshape.exception.ResourceNotFoundException;
import com.sheshape.model.User;
import com.sheshape.repository.UserRepository;
import com.sheshape.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDto getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("User not authenticated");
        }
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        return new UserDto(user);
    }

    @Override
    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElse(null);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getAllUsersByRole(User.Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        return new UserDto(user);
    }

    @Override
    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        // Update fields
        if (userDto.getUsername() != null) {
            user.setUsername(userDto.getUsername());
        }
        
        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        
        if (userDto.getIsActive() != null) {
            user.setIsActive(userDto.getIsActive());
        }
        
        // Save updated user
        User updatedUser = userRepository.save(user);
        
        return new UserDto(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        userRepository.delete(user);
    }

    @Override
    public List<UserDto> getPublicTrainers() {
        return userRepository.findByRole(User.Role.TRAINER).stream()
                .filter(User::getIsActive)
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> getPublicNutritionists() {
        return userRepository.findByRole(User.Role.NUTRITIONIST).stream()
                .filter(User::getIsActive)
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Override
    public Long getUserIdByUsernameOrEmail(String username) {
        return userRepository.findByUsernameOrEmail(username,username).map(User::getId).orElse(null);
    }
    @Override
    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        // Check if username is already taken
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }

        // Check if email is already in use
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Set password - if not provided, generate a default one or require it
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        } else {
            // You might want to generate a temporary password or require it
            throw new BadRequestException("Password is required");
        }

        user.setIsActive(true);
        user.setProfileCompleted(false);

        // Set role based on request
        try {
            User.Role role = User.Role.valueOf(request.getRole().toUpperCase());
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        // Save user
        User savedUser = userRepository.save(user);

        return new UserDto(savedUser);
    }

    @Override
    @Transactional
    public UserDto toggleUserStatus(Long id, boolean isActive) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setIsActive(isActive);

        User updatedUser = userRepository.save(user);

        return new UserDto(updatedUser);
    }
    @Override
    public UserDto getPublicTrainerById(Long id) {
        User trainer = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer not found"));

        if (!trainer.getRole().equals(User.Role.TRAINER)) {
            throw new ResourceNotFoundException("User is not a trainer");
        }

        if (!trainer.getIsActive()) {
            throw new ResourceNotFoundException("Trainer is not available");
        }

        return new UserDto(trainer);
    }

    @Override
    public UserDto getPublicNutritionistById(Long id) {
        User nutritionist = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nutritionist not found"));

        if (!nutritionist.getRole().equals(User.Role.NUTRITIONIST)) {
            throw new ResourceNotFoundException("User is not a nutritionist");
        }

        if (!nutritionist.getIsActive()) {
            throw new ResourceNotFoundException("Nutritionist is not available");
        }

        return new UserDto(nutritionist);
    }
}