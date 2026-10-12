package com.college.bus.tracker.dto.response;

import com.college.bus.tracker.entity.LocationStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class LocationResponse {

    private Double latitude;
    private Double longitude;
    private Double speed;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime recordedAt;

    private LocationStatus status;

    public LocationResponse() {
    }

    public LocationResponse(Double latitude, Double longitude, Double speed, LocalDateTime recordedAt, LocationStatus status) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.speed = speed;
        this.recordedAt = recordedAt;
        this.status = status;
    }

    public static LocationResponse unavailable() {
        return new LocationResponse(null, null, null, null, LocationStatus.UNAVAILABLE);
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

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public LocationStatus getStatus() {
        return status;
    }

    public void setStatus(LocationStatus status) {
        this.status = status;
    }
}
