package com.gym.repository;

import com.gym.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkoutRepo extends JpaRepository<Workout, Long> {
    List<Workout> findByUserId(Long userId);
}
