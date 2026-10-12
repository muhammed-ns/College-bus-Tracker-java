package com.college.bus.tracker.service;

import com.college.bus.tracker.dto.request.StopRequest;
import com.college.bus.tracker.dto.response.RouteResponse;
import com.college.bus.tracker.dto.response.StopResponse;
import com.college.bus.tracker.entity.Route;
import com.college.bus.tracker.entity.Stop;
import com.college.bus.tracker.exception.ResourceNotFoundException;
import com.college.bus.tracker.repository.RouteRepository;
import com.college.bus.tracker.repository.StopRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;

    public RouteService(RouteRepository routeRepository, StopRepository stopRepository) {
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
    }

    @Transactional(readOnly = true)
    public Route getPrimaryRouteEntity() {
        return routeRepository.findFirstByActiveTrueOrderByIdAsc()
                .or(() -> routeRepository.findFirstByOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("No route configured in system"));
    }

    @Transactional(readOnly = true)
    public RouteResponse getRouteAndStops() {
        Route route = getPrimaryRouteEntity();
        List<Stop> stops = stopRepository.findByRouteIdOrderByStopOrderAsc(route.getId());

        List<StopResponse> stopResponses = stops.stream()
                .map(this::toStopResponse)
                .collect(Collectors.toList());

        return new RouteResponse(
                route.getId(),
                route.getRouteName(),
                route.getDescription(),
                route.isActive(),
                route.getCreatedAt(),
                stopResponses
        );
    }

    @Transactional
    public StopResponse addStop(StopRequest request) {
        Route route = getPrimaryRouteEntity();

        Stop stop = new Stop();
        stop.setRoute(route);
        stop.setStopName(request.getStopName().trim());
        stop.setLatitude(request.getLatitude());
        stop.setLongitude(request.getLongitude());
        stop.setStopOrder(request.getStopOrder());

        Stop savedStop = stopRepository.save(stop);
        return toStopResponse(savedStop);
    }

    @Transactional
    public StopResponse updateStop(Long stopId, StopRequest request) {
        Stop stop = stopRepository.findById(stopId)
                .orElseThrow(() -> new ResourceNotFoundException("Stop not found with ID: " + stopId));

        stop.setStopName(request.getStopName().trim());
        stop.setLatitude(request.getLatitude());
        stop.setLongitude(request.getLongitude());
        stop.setStopOrder(request.getStopOrder());

        Stop updatedStop = stopRepository.save(stop);
        return toStopResponse(updatedStop);
    }

    @Transactional
    public void deleteStop(Long stopId) {
        if (!stopRepository.existsById(stopId)) {
            throw new ResourceNotFoundException("Stop not found with ID: " + stopId);
        }
        stopRepository.deleteById(stopId);
    }

    public StopResponse toStopResponse(Stop stop) {
        return new StopResponse(
                stop.getId(),
                stop.getRoute().getId(),
                stop.getStopName(),
                stop.getLatitude(),
                stop.getLongitude(),
                stop.getStopOrder()
        );
    }
}
