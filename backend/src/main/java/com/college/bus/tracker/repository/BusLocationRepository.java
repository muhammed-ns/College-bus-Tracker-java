package com.college.bus.tracker.repository;

import com.college.bus.tracker.entity.BusLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusLocationRepository extends JpaRepository<BusLocation, Long> {
    Optional<BusLocation> findFirstByTripIdOrderByRecordedAtDesc(Long tripId);
    List<BusLocation> findTop20ByTripIdOrderByRecordedAtDesc(Long tripId);
}
