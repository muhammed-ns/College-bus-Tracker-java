package com.college.bus.tracker.service;

import com.college.bus.tracker.dto.request.BusUpdateRequest;
import com.college.bus.tracker.dto.response.BusResponse;
import com.college.bus.tracker.entity.Bus;
import com.college.bus.tracker.entity.BusStatus;
import com.college.bus.tracker.exception.ResourceNotFoundException;
import com.college.bus.tracker.repository.BusRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BusService {

    private final BusRepository busRepository;

    public BusService(BusRepository busRepository) {
        this.busRepository = busRepository;
    }

    @Transactional(readOnly = true)
    public Bus getPrimaryBusEntity() {
        return busRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Bus record not found"));
    }

    @Transactional(readOnly = true)
    public BusResponse getBusDetails() {
        Bus bus = getPrimaryBusEntity();
        return toResponse(bus);
    }

    @Transactional
    public BusResponse updateBusDetails(BusUpdateRequest request) {
        Bus bus = busRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    Bus newBus = new Bus();
                    newBus.setStatus(BusStatus.ACTIVE);
                    return newBus;
                });

        bus.setBusNumber(request.getBusNumber().trim());
        bus.setRegistrationNumber(request.getRegistrationNumber().trim());
        bus.setStatus(request.getStatus());

        Bus saved = busRepository.save(bus);
        return toResponse(saved);
    }

    private BusResponse toResponse(Bus bus) {
        return new BusResponse(
                bus.getId(),
                bus.getBusNumber(),
                bus.getRegistrationNumber(),
                bus.getStatus(),
                bus.getCreatedAt(),
                bus.getUpdatedAt()
        );
    }
}
