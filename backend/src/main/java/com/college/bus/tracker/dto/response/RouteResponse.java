package com.college.bus.tracker.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class RouteResponse {

    private Long id;
    private String routeName;
    private String description;
    private boolean active;
    private LocalDateTime createdAt;
    private List<StopResponse> stops = new ArrayList<>();

    public RouteResponse() {
    }

    public RouteResponse(Long id, String routeName, String description, boolean active, LocalDateTime createdAt, List<StopResponse> stops) {
        this.id = id;
        this.routeName = routeName;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
        this.stops = stops;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<StopResponse> getStops() {
        return stops;
    }

    public void setStops(List<StopResponse> stops) {
        this.stops = stops;
    }
}
