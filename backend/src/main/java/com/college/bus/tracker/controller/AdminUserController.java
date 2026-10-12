package com.college.bus.tracker.controller;

import com.college.bus.tracker.dto.request.CreateDriverRequest;
import com.college.bus.tracker.dto.response.DriverSummaryResponse;
import com.college.bus.tracker.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final DriverService driverService;

    public AdminUserController(DriverService driverService) {
        this.driverService = driverService;
    }

    @GetMapping("/driver")
    public ResponseEntity<DriverSummaryResponse> getDriver() {
        DriverSummaryResponse driver = driverService.getPrimaryDriver();
        return ResponseEntity.ok(driver);
    }

    @GetMapping("/drivers")
    public ResponseEntity<List<DriverSummaryResponse>> getAllDrivers() {
        List<DriverSummaryResponse> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @PostMapping("/driver")
    public ResponseEntity<DriverSummaryResponse> createDriver(@Valid @RequestBody CreateDriverRequest request) {
        DriverSummaryResponse created = driverService.createDriver(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/driver/{id}/status")
    public ResponseEntity<DriverSummaryResponse> toggleDriverStatus(@PathVariable("id") Long id,
                                                                    @RequestParam(value = "enabled", required = false) Boolean enabled) {
        DriverSummaryResponse updated = driverService.toggleDriverStatus(id, enabled);
        return ResponseEntity.ok(updated);
    }
}
