package com.academy.football_academy_backend.dto;

import lombok.Data;

@Data
public class KidBalanceDTO {
    private Long kidId;
    private String kidName;
    private Double outstandingBalance;

    public KidBalanceDTO(KidBalance balance) {
        this.kidId = balance.getKid().getKidId();
        this.kidName = balance.getKid().getFirstName() + " " + balance.getKid().getLastName();
        this.outstandingBalance = balance.getOutstandingBalance();
    }
}