package com.college.bus.tracker.service;

import com.college.bus.tracker.dto.request.CreateDriverRequest;
import com.college.bus.tracker.dto.response.DriverSummaryResponse;
import com.college.bus.tracker.entity.Role;
import com.college.bus.tracker.entity.User;
import com.college.bus.tracker.exception.BadRequestException;
import com.college.bus.tracker.exception.ResourceNotFoundException;
import com.college.bus.tracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DriverService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public DriverSummaryResponse getPrimaryDriver() {
        return userRepository.findFirstByRole(Role.DRIVER)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<DriverSummaryResponse> getAllDrivers() {
        return userRepository.findByRole(Role.DRIVER).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DriverSummaryResponse createDriver(CreateDriverRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with email " + email + " already exists");
        }

        User driver = new User();
        driver.setName(request.getName().trim());
        driver.setEmail(email);
        driver.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        driver.setRole(Role.DRIVER);
        driver.setEnabled(true);

        User saved = userRepository.save(driver);
        return toResponse(saved);
    }

    @Transactional
    public DriverSummaryResponse toggleDriverStatus(Long driverId, Boolean enabled) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverId));

        if (driver.getRole() != Role.DRIVER) {
            throw new BadRequestException("User is not a driver");
        }

        if (enabled != null) {
            driver.setEnabled(enabled);
        } else {
            driver.setEnabled(!driver.isEnabled());
        }

        User updated = userRepository.save(driver);
        return toResponse(updated);
    }

    private DriverSummaryResponse toResponse(User user) {
        return new DriverSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}
