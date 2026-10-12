package com.college.bus.tracker.controller;

import com.college.bus.tracker.dto.response.TripResponse;
import com.college.bus.tracker.security.UserPrincipal;
import com.college.bus.tracker.service.TripService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping("/trip/active")
    public ResponseEntity<TripResponse> getActiveTrip() {
        TripResponse activeTrip = tripService.getActiveTrip();
        return ResponseEntity.ok(activeTrip);
    }

    @PostMapping("/driver/trip/start")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<TripResponse> startTrip(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        TripResponse trip = tripService.startTrip(userPrincipal.getId());
        return ResponseEntity.ok(trip);
    }

    @PostMapping("/driver/trip/end")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<TripResponse> endTrip(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        TripResponse trip = tripService.endTrip(userPrincipal.getId());
        return ResponseEntity.ok(trip);
    }
}
