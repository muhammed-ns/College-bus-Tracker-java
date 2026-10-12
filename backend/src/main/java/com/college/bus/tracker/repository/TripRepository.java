package com.college.bus.tracker.repository;

import com.college.bus.tracker.entity.Trip;
import com.college.bus.tracker.entity.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    Optional<Trip> findFirstByStatus(TripStatus status);
    Optional<Trip> findFirstByDriverIdAndStatus(Long driverId, TripStatus status);
    Optional<Trip> findFirstByBusIdAndStatus(Long busId, TripStatus status);
    Optional<Trip> findFirstByOrderByIdDesc();
}
