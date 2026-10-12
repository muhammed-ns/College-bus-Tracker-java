package com.college.bus.tracker.repository;

import com.college.bus.tracker.entity.Stop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StopRepository extends JpaRepository<Stop, Long> {
    List<Stop> findByRouteIdOrderByStopOrderAsc(Long routeId);
    void deleteByRouteId(Long routeId);
}
