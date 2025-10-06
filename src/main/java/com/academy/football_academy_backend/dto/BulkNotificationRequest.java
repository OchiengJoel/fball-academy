package com.academy.football_academy_backend.dto;

import java.util.List;

public class BulkNotificationRequest {

    private List<Long> userIds;
    private String message;

    public BulkNotificationRequest() {
    }

    public BulkNotificationRequest(List<Long> userIds, String message) {
        this.userIds = userIds;
        this.message = message;
    }

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
