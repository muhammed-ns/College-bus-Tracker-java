package com.college.bus.tracker.config;

import com.college.bus.tracker.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("{\"timestamp\":\"" + java.time.LocalDateTime.now() + "\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Full authentication is required to access this resource\"}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public Authentication
                        .requestMatchers("/api/auth/**").permitAll()
                        // Public WebSocket handshake
                        .requestMatchers("/ws-bus/**").permitAll()
                        // Public H2 Console
                        .requestMatchers("/h2-console/**").permitAll()
                        // Public Student/Guest Read APIs
                        .requestMatchers(HttpMethod.GET, "/api/bus").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/route").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/bus/location/latest").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/trip/active").permitAll()
                        // Student-specific endpoints (if any)
                        .requestMatchers("/api/student/**").hasAnyRole("STUDENT", "ADMIN")
                        // Admin-specific endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Driver-specific endpoints
                        .requestMatchers("/api/driver/**").hasRole("DRIVER")
                        // All other endpoints
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
