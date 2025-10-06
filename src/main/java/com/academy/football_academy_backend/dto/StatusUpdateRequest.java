package com.academy.football_academy_backend.dto;

import com.academy.football_academy_backend.model.Kid;
import lombok.Data;

@Data
class StatusUpdateRequest {
    private Kid.Status status;
}
