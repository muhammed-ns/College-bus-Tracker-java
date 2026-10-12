package com.college.bus.tracker.dto.response;

import com.college.bus.tracker.entity.BusStatus;
import java.time.LocalDateTime;

public class BusResponse {

    private Long id;
    private String busNumber;
    private String registrationNumber;
    private BusStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BusResponse() {
    }

    public BusResponse(Long id, String busNumber, String registrationNumber, BusStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.busNumber = busNumber;
        this.registrationNumber = registrationNumber;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusNumber() {
        return busNumber;
    }

    public void setBusNumber(String busNumber) {
        this.busNumber = busNumber;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public BusStatus getStatus() {
        return status;
    }

    public void setStatus(BusStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
