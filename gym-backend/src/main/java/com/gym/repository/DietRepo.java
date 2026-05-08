package com.gym.repository;
import com.gym.entity.Diet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DietRepo extends JpaRepository<Diet, Long> {
    List<Diet> findByUserId(Long userId);
}
