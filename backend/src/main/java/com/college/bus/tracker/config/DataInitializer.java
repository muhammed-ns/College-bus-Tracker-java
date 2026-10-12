package com.college.bus.tracker.config;

import com.college.bus.tracker.entity.*;
import com.college.bus.tracker.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final StopRepository stopRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           BusRepository busRepository,
                           RouteRepository routeRepository,
                           StopRepository stopRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.busRepository = busRepository;
        this.routeRepository = routeRepository;
        this.stopRepository = stopRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        Bus bus = seedBus();
        Route route = seedRouteAndStops();
        logger.info("Database verification and seed initialization completed successfully.");
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@college.edu")) {
            User admin = new User();
            admin.setName("Campus Transit Admin");
            admin.setEmail("admin@college.edu");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            logger.info("Seeded Admin user: admin@college.edu");
        }

        if (!userRepository.existsByEmail("driver@college.edu")) {
            User driver = new User();
            driver.setName("Michael Driver");
            driver.setEmail("driver@college.edu");
            driver.setPasswordHash(passwordEncoder.encode("driver123"));
            driver.setRole(Role.DRIVER);
            driver.setEnabled(true);
            userRepository.save(driver);
            logger.info("Seeded Driver user: driver@college.edu");
        }

        if (!userRepository.existsByEmail("student@college.edu")) {
            User student = new User();
            student.setName("Alex Student");
            student.setEmail("student@college.edu");
            student.setPasswordHash(passwordEncoder.encode("student123"));
            student.setRole(Role.STUDENT);
            student.setEnabled(true);
            userRepository.save(student);
            logger.info("Seeded Student user: student@college.edu");
        }
    }

    private Bus seedBus() {
        return busRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            Bus bus = new Bus();
            bus.setBusNumber("CEA College Bus 1");
            bus.setRegistrationNumber("KL-26-CEA-101");
            bus.setStatus(BusStatus.ACTIVE);
            Bus savedBus = busRepository.save(bus);
            logger.info("Seeded Bus: {}", savedBus.getBusNumber());
            return savedBus;
        });
    }

    private Route seedRouteAndStops() {
        Route route = routeRepository.findFirstByOrderByIdAsc().orElseGet(() -> {
            Route newRoute = new Route();
            newRoute.setRouteName("CEA Campus & Adoor Town Route");
            newRoute.setDescription("Daily student transit route starting from College of Engineering Adoor, traveling via Manakala, Adoor Central, Parakode, Ezhamkulam, and ending at College of Engineering Adoor");
            newRoute.setActive(true);
            Route savedRoute = routeRepository.save(newRoute);
            logger.info("Seeded Route: {}", savedRoute.getRouteName());
            return savedRoute;
        });

        List<Stop> existingStops = stopRepository.findByRouteIdOrderByStopOrderAsc(route.getId());
        if (existingStops.isEmpty()) {
            List<Stop> stops = Arrays.asList(
                    new Stop(null, route, "College of Engineering Adoor (Departure Gate)", 9.1324, 76.7182, 1),
                    new Stop(null, route, "Manakala Junction", 9.1352, 76.7225, 2),
                    new Stop(null, route, "Karuvatta Junction", 9.1440, 76.7310, 3),
                    new Stop(null, route, "Adoor KSRTC Central Bus Stand", 9.1538, 76.7335, 4),
                    new Stop(null, route, "Adoor Revenue Tower / Private Stand", 9.1560, 76.7360, 5),
                    new Stop(null, route, "Parakode Junction Market", 9.1425, 76.7512, 6),
                    new Stop(null, route, "Ezhamkulam Temple Junction", 9.1305, 76.7580, 7),
                    new Stop(null, route, "College of Engineering Adoor (Arrival Terminal)", 9.1324, 76.7182, 8)
            );
            stopRepository.saveAll(stops);
            logger.info("Seeded 8 stops starting and ending at College of Engineering Adoor");
        }

        return route;
    }
}
