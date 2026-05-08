package com.gym.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String exercise;
    private String reps;
    private String date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
