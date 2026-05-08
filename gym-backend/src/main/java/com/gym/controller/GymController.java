package com.gym.controller;

import com.gym.entity.*;
import com.gym.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class GymController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private DietRepo dietRepo;

    @Autowired
    private WorkoutRepo workoutRepo;

    // USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<User> getUser(@PathVariable Long userId) {
        return userRepo.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/user/{userId}/update")
    public ResponseEntity<User> updateUser(@PathVariable Long userId, @RequestBody User userData) {
        return userRepo.findById(userId).map(user -> {
            user.setName(userData.getName());
            user.setWeight(userData.getWeight());
            user.setTargetWeight(userData.getTargetWeight());
            return ResponseEntity.ok(userRepo.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DIET
    @PostMapping("/diet/{userId}")
    public ResponseEntity<Diet> addDiet(@PathVariable Long userId, @RequestBody Diet diet) {
        return userRepo.findById(userId).map(user -> {
            diet.setUser(user);
            return ResponseEntity.ok(dietRepo.save(diet));
        }).orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/diet/{userId}")
    public List<Diet> getDiet(@PathVariable Long userId) {
        return dietRepo.findByUserId(userId);
    }

    // WORKOUT
    @PostMapping("/workout/{userId}")
    public ResponseEntity<Workout> addWorkout(@PathVariable Long userId, @RequestBody Workout workout) {
        return userRepo.findById(userId).map(user -> {
            workout.setUser(user);
            return ResponseEntity.ok(workoutRepo.save(workout));
        }).orElse(ResponseEntity.badRequest().build());
    }

    @GetMapping("/workout/{userId}")
    public List<Workout> getWorkout(@PathVariable Long userId) {
        return workoutRepo.findByUserId(userId);
    }
}