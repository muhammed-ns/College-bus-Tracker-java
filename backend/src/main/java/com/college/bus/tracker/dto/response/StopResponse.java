package com.college.bus.tracker.dto.response;

public class StopResponse {

    private Long id;
    private Long routeId;
    private String stopName;
    private Double latitude;
    private Double longitude;
    private Integer stopOrder;

    public StopResponse() {
    }

    public StopResponse(Long id, Long routeId, String stopName, Double latitude, Double longitude, Integer stopOrder) {
        this.id = id;
        this.routeId = routeId;
        this.stopName = stopName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stopOrder = stopOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRouteId() {
        return routeId;
    }

    public void setRouteId(Long routeId) {
        this.routeId = routeId;
    }

    public String getStopName() {
        return stopName;
    }

    public void setStopName(String stopName) {
        this.stopName = stopName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Integer getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
    }
}
