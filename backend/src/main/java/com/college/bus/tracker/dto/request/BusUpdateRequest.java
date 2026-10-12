package com.college.bus.tracker.dto.request;

import com.college.bus.tracker.entity.BusStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BusUpdateRequest {

    @NotBlank(message = "Bus number is required")
    private String busNumber;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Bus status is required")
    private BusStatus status;

    public BusUpdateRequest() {
    }

    public BusUpdateRequest(String busNumber, String registrationNumber, BusStatus status) {
        this.busNumber = busNumber;
        this.registrationNumber = registrationNumber;
        this.status = status;
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
}
