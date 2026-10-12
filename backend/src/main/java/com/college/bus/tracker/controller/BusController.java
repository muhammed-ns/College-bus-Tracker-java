package com.college.bus.tracker.controller;

import com.college.bus.tracker.dto.request.BusUpdateRequest;
import com.college.bus.tracker.dto.response.BusResponse;
import com.college.bus.tracker.service.BusService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BusController {

    private final BusService busService;

    public BusController(BusService busService) {
        this.busService = busService;
    }

    @GetMapping("/bus")
    public ResponseEntity<BusResponse> getBus() {
        BusResponse bus = busService.getBusDetails();
        return ResponseEntity.ok(bus);
    }

    @PutMapping("/admin/bus")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BusResponse> updateBus(@Valid @RequestBody BusUpdateRequest request) {
        BusResponse updated = busService.updateBusDetails(request);
        return ResponseEntity.ok(updated);
    }
}
