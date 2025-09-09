package com.sheshape.service;

import com.sheshape.dto.UserDto;
import com.sheshape.dto.response.CreateUserRequest;
import com.sheshape.model.User;

import java.util.List;

public interface UserService {
    UserDto getPublicTrainerById(Long id);
    UserDto getPublicNutritionistById(Long id);
    
    UserDto getCurrentUser();
    
    Long getUserIdByUsername(String username);
    
    List<UserDto> getAllUsers();
    
    List<UserDto> getAllUsersByRole(User.Role role);
    
    UserDto getUserById(Long id);
    
    UserDto updateUser(Long id, UserDto userDto);
    
    void deleteUser(Long id);
    
    List<UserDto> getPublicTrainers();
    
    List<UserDto> getPublicNutritionists();
    Long getUserIdByUsernameOrEmail(String username);
    UserDto createUser(CreateUserRequest request);
    UserDto toggleUserStatus(Long id, boolean isActive);
}