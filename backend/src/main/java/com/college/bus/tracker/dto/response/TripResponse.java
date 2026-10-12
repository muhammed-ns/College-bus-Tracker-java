package com.college.bus.tracker.dto.response;

import com.college.bus.tracker.entity.TripStatus;
import java.time.LocalDateTime;

public class TripResponse {

    private Long id;
    private Long busId;
    private String busNumber;
    private String registrationNumber;
    private Long driverId;
    private String driverName;
    private Long routeId;
    private String routeName;
    private TripStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;

    public TripResponse() {
    }

    public TripResponse(Long id, Long busId, String busNumber, String registrationNumber,
                        Long driverId, String driverName, Long routeId, String routeName,
                        TripStatus status, LocalDateTime startedAt, LocalDateTime endedAt) {
        this.id = id;
        this.busId = busId;
        this.busNumber = busNumber;
        this.registrationNumber = registrationNumber;
        this.driverId = driverId;
        this.driverName = driverName;
        this.routeId = routeId;
        this.routeName = routeName;
        this.status = status;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBusId() {
        return busId;
    }

    public void setBusId(Long busId) {
        this.busId = busId;
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

    public Long getDriverId() {
        return driverId;
    }

    public void setDriverId(Long driverId) {
        this.driverId = driverId;
    }

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public Long getRouteId() {
        return routeId;
    }

    public void setRouteId(Long routeId) {
        this.routeId = routeId;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public TripStatus getStatus() {
        return status;
    }

    public void setStatus(TripStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }
}
