package com.college.bus.tracker.service;

import com.college.bus.tracker.dto.request.LocationUpdateRequest;
import com.college.bus.tracker.dto.response.LocationResponse;
import com.college.bus.tracker.entity.*;
import com.college.bus.tracker.exception.BadRequestException;
import com.college.bus.tracker.repository.BusLocationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class LocationService {

    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    private final BusLocationRepository busLocationRepository;
    private final TripService tripService;
    private final SimpMessagingTemplate messagingTemplate;
    private final long staleThresholdSeconds;

    // Fast in-memory cache for the latest broadcasted bus location
    private final AtomicReference<LocationResponse> latestLocationCache = new AtomicReference<>(null);

    public LocationService(BusLocationRepository busLocationRepository,
                           TripService tripService,
                           SimpMessagingTemplate messagingTemplate,
                           @Value("${app.bus.stale-threshold-seconds:30}") long staleThresholdSeconds) {
        this.busLocationRepository = busLocationRepository;
        this.tripService = tripService;
        this.messagingTemplate = messagingTemplate;
        this.staleThresholdSeconds = staleThresholdSeconds;
    }

    @Transactional
    public LocationResponse recordLocation(Long driverUserId, LocationUpdateRequest request) {
        // Business Rule: Trip must exist and be RUNNING
        Trip activeTrip = tripService.getActiveRunningTripEntity()
                .orElseThrow(() -> new BadRequestException("No active RUNNING trip found to update location"));

        // Business Rule: Driver must be the assigned driver
        if (!activeTrip.getDriver().getId().equals(driverUserId)) {
            throw new BadRequestException("You are not the assigned driver for the current running trip");
        }

        // Validate coordinate bounds
        if (request.getLatitude() < -90.0 || request.getLatitude() > 90.0) {
            throw new BadRequestException("Latitude must be between -90 and 90 degrees");
        }
        if (request.getLongitude() < -180.0 || request.getLongitude() > 180.0) {
            throw new BadRequestException("Longitude must be between -180 and 180 degrees");
        }

        LocalDateTime now = LocalDateTime.now();

        // Persist to database
        BusLocation busLocation = new BusLocation();
        busLocation.setTrip(activeTrip);
        busLocation.setLatitude(request.getLatitude());
        busLocation.setLongitude(request.getLongitude());
        busLocation.setSpeed(request.getSpeed() != null ? request.getSpeed() : 0.0);
        busLocation.setRecordedAt(now);

        busLocationRepository.save(busLocation);

        // Prepare live response
        LocationResponse response = new LocationResponse(
                busLocation.getLatitude(),
                busLocation.getLongitude(),
                busLocation.getSpeed(),
                busLocation.getRecordedAt(),
                LocationStatus.LIVE
        );

        // Update in-memory cache
        latestLocationCache.set(response);

        // Publish to WebSocket topic /topic/bus/1/location
        String destination = "/topic/bus/" + activeTrip.getBus().getId() + "/location";
        messagingTemplate.convertAndSend(destination, response);
        logger.debug("Broadcasted location to {}: {}, {}", destination, response.getLatitude(), response.getLongitude());

        return response;
    }

    @Transactional(readOnly = true)
    public LocationResponse getLatestLocation() {
        Optional<Trip> activeTripOpt = tripService.getActiveRunningTripEntity();
        if (activeTripOpt.isEmpty()) {
            return LocationResponse.unavailable();
        }

        Trip activeTrip = activeTripOpt.get();
        LocationResponse cached = latestLocationCache.get();

        if (cached != null) {
            return evaluateStatus(cached);
        }

        // Fallback: Query database if cache was cleared (e.g. after restart)
        Optional<BusLocation> lastDbLocation = busLocationRepository.findFirstByTripIdOrderByRecordedAtDesc(activeTrip.getId());
        if (lastDbLocation.isEmpty()) {
            return LocationResponse.unavailable();
        }

        BusLocation loc = lastDbLocation.get();
        LocationResponse fromDb = new LocationResponse(
                loc.getLatitude(),
                loc.getLongitude(),
                loc.getSpeed(),
                loc.getRecordedAt(),
                LocationStatus.LIVE
        );

        return evaluateStatus(fromDb);
    }

    private LocationResponse evaluateStatus(LocationResponse loc) {
        if (loc.getRecordedAt() == null) {
            loc.setStatus(LocationStatus.UNAVAILABLE);
            return loc;
        }

        long secondsElapsed = Math.abs(Duration.between(loc.getRecordedAt(), LocalDateTime.now()).getSeconds());
        if (secondsElapsed > staleThresholdSeconds) {
            loc.setStatus(LocationStatus.STALE);
        } else {
            loc.setStatus(LocationStatus.LIVE);
        }
        return loc;
    }

    public void clearCache() {
        latestLocationCache.set(null);
    }
}
