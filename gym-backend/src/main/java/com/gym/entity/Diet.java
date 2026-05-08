package com.gym.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Diet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String meal;
    private String calories;
    private String date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
