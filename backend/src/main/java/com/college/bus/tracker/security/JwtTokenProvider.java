package com.college.bus.tracker.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final Key signingKey;
    private final long jwtExpirationInMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret:c2VjdXJlLWNvbGxlZ2UtYnVzLXRyYWNrZXItand0LXNlY3JldC1rZXktMjAyNi1zdXBlci1zZWNyZXQ=}") String jwtSecret,
            @Value("${app.jwt.expiration-ms:86400000}") long jwtExpirationInMs) {
        this.jwtExpirationInMs = jwtExpirationInMs;
        this.signingKey = buildKey(jwtSecret);
    }

    private Key buildKey(String secret) {
        byte[] keyBytes;
        try {
            // Attempt Base64 decode first
            keyBytes = Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                // If decoded bytes are less than 256 bits, fall back to utf8 bytes padded
                keyBytes = padBytes(secret.getBytes(StandardCharsets.UTF_8));
            }
        } catch (Exception e) {
            keyBytes = padBytes(secret.getBytes(StandardCharsets.UTF_8));
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private byte[] padBytes(byte[] input) {
        if (input.length >= 32) {
            return input;
        }
        byte[] padded = new byte[32];
        System.arraycopy(input, 0, padded, 0, input.length);
        for (int i = input.length; i < 32; i++) {
            padded[i] = (byte) '#';
        }
        return padded;
    }

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateTokenFromUsername(userPrincipal.getUsername(), userPrincipal.getId(), userPrincipal.getRole().name());
    }

    public String generateTokenFromUsername(String email, Long userId, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationInMs);

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJwt(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException | MalformedJwtException ex) {
            logger.error("Invalid JWT signature");
        } catch (ExpiredJwtException ex) {
            logger.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            logger.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            logger.error("JWT claims string is empty.");
        }
        return false;
    }
}
