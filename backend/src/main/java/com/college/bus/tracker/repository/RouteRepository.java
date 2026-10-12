package com.college.bus.tracker.repository;

import com.college.bus.tracker.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    Optional<Route> findFirstByActiveTrueOrderByIdAsc();
    Optional<Route> findFirstByOrderByIdAsc();
}
