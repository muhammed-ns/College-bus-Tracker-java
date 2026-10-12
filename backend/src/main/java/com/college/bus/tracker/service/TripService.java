package com.college.bus.tracker.service;

import com.college.bus.tracker.dto.response.TripResponse;
import com.college.bus.tracker.entity.*;
import com.college.bus.tracker.exception.BadRequestException;
import com.college.bus.tracker.exception.ResourceNotFoundException;
import com.college.bus.tracker.repository.TripRepository;
import com.college.bus.tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BusService busService;
    private final RouteService routeService;

    public TripService(TripRepository tripRepository,
                       UserRepository userRepository,
                       BusService busService,
                       RouteService routeService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.busService = busService;
        this.routeService = routeService;
    }

    @Transactional(readOnly = true)
    public Optional<Trip> getActiveRunningTripEntity() {
        return tripRepository.findFirstByStatus(TripStatus.RUNNING);
    }

    @Transactional(readOnly = true)
    public TripResponse getActiveTrip() {
        Optional<Trip> runningTrip = tripRepository.findFirstByStatus(TripStatus.RUNNING);
        if (runningTrip.isPresent()) {
            return toTripResponse(runningTrip.get());
        }

        // If no running trip, return the latest trip (e.g. COMPLETED or NOT_STARTED) for context
        Optional<Trip> latestTrip = tripRepository.findFirstByOrderByIdDesc();
        return latestTrip.map(this::toTripResponse).orElse(null);
    }

    @Transactional
    public TripResponse startTrip(Long driverUserId) {
        // Business Rule: Only one active RUNNING trip at a time
        Optional<Trip> existingRunningTrip = tripRepository.findFirstByStatus(TripStatus.RUNNING);
        if (existingRunningTrip.isPresent()) {
            throw new BadRequestException("A trip is already running with ID " + existingRunningTrip.get().getId());
        }

        User driver = userRepository.findById(driverUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver user not found"));

        if (!driver.isEnabled()) {
            throw new BadRequestException("Driver account is disabled");
        }

        Bus bus = busService.getPrimaryBusEntity();
        if (bus.getStatus() != BusStatus.ACTIVE) {
            throw new BadRequestException("Bus is currently marked as INACTIVE");
        }

        Route route = routeService.getPrimaryRouteEntity();

        Trip trip = new Trip();
        trip.setBus(bus);
        trip.setDriver(driver);
        trip.setRoute(route);
        trip.setStatus(TripStatus.RUNNING);
        trip.setStartedAt(LocalDateTime.now());
        trip.setEndedAt(null);

        Trip savedTrip = tripRepository.save(trip);
        return toTripResponse(savedTrip);
    }

    @Transactional
    public TripResponse endTrip(Long driverUserId) {
        Trip trip = tripRepository.findFirstByStatus(TripStatus.RUNNING)
                .orElseThrow(() -> new BadRequestException("No active running trip to end"));

        User caller = userRepository.findById(driverUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If not admin, verify driver is the assigned driver
        if (caller.getRole() != Role.ADMIN && !trip.getDriver().getId().equals(driverUserId)) {
            throw new BadRequestException("You are not the driver assigned to this running trip");
        }

        trip.setStatus(TripStatus.COMPLETED);
        trip.setEndedAt(LocalDateTime.now());

        Trip completedTrip = tripRepository.save(trip);
        return toTripResponse(completedTrip);
    }

    public TripResponse toTripResponse(Trip trip) {
        return new TripResponse(
                trip.getId(),
                trip.getBus().getId(),
                trip.getBus().getBusNumber(),
                trip.getBus().getRegistrationNumber(),
                trip.getDriver().getId(),
                trip.getDriver().getName(),
                trip.getRoute().getId(),
                trip.getRoute().getRouteName(),
                trip.getStatus(),
                trip.getStartedAt(),
                trip.getEndedAt()
        );
    }
}
