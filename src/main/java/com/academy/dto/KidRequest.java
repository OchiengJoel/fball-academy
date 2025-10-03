package com.academy.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class KidRequest {
    private Long parentId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private List<Long> feeScheduleIds; // IDs of fee schedules to apply
}
