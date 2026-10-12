package com.college.bus.tracker.controller;

import com.college.bus.tracker.dto.request.LocationUpdateRequest;
import com.college.bus.tracker.dto.response.LocationResponse;
import com.college.bus.tracker.security.UserPrincipal;
import com.college.bus.tracker.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/driver/location")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<LocationResponse> updateLocation(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                           @Valid @RequestBody LocationUpdateRequest request) {
        LocationResponse response = locationService.recordLocation(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bus/location/latest")
    public ResponseEntity<LocationResponse> getLatestLocation() {
        LocationResponse response = locationService.getLatestLocation();
        return ResponseEntity.ok(response);
    }
}
