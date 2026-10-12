package com.college.bus.tracker.repository;

import com.college.bus.tracker.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {
    Optional<Bus> findFirstByOrderByIdAsc();
}
