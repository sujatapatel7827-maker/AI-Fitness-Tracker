package com.gym.service;

import com.gym.dto.AuthRequest;
import com.gym.dto.AuthResponse;
import com.gym.entity.User;
import com.gym.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepo userRepo;

    public AuthResponse signup(AuthRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // In real app, use BCrypt
        user = userRepo.save(user);
        return new AuthResponse(user.getId(), user.getName(), user.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());
        
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(request.getPassword())) {
            User user = userOpt.get();
            return new AuthResponse(user.getId(), user.getName(), user.getEmail());
        }
        throw new RuntimeException("Invalid credentials");
    }
}
