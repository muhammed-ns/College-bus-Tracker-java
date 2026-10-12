package com.college.bus.tracker.controller;

import com.college.bus.tracker.dto.request.StopRequest;
import com.college.bus.tracker.dto.response.RouteResponse;
import com.college.bus.tracker.dto.response.StopResponse;
import com.college.bus.tracker.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/route")
    public ResponseEntity<RouteResponse> getRoute() {
        RouteResponse route = routeService.getRouteAndStops();
        return ResponseEntity.ok(route);
    }

    @PostMapping("/admin/stops")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StopResponse> addStop(@Valid @RequestBody StopRequest request) {
        StopResponse created = routeService.addStop(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/stops/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StopResponse> updateStop(@PathVariable("id") Long id,
                                                   @Valid @RequestBody StopRequest request) {
        StopResponse updated = routeService.updateStop(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/stops/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteStop(@PathVariable("id") Long id) {
        routeService.deleteStop(id);
        return ResponseEntity.noContent().build();
    }
}
