package com.examly.springapp.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret:9a4f2c8d7e1b5a3f6c9d2e8a4b7c1e5f9a4f2c8d7e1b5a3f6c9d2e8a4b7c1e5f}")
    private String secret;

    @Value("${jwt.expiration.user:28800000}")
    private long userExpiration; // 8 hours

    @Value("${jwt.expiration.staff:43200000}")
    private long staffExpiration; // 12 hours

    @Value("${jwt.expiration.admin:86400000}")
    private long adminExpiration; // 24 hours

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("userId");
        return id != null ? Long.valueOf(id.toString()) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String generateToken(Long userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        claims.put("email", email);

        long exp = userExpiration;
        if ("ADMIN".equalsIgnoreCase(role)) {
            exp = adminExpiration;
        } else if ("CATEGORY_MANAGER".equalsIgnoreCase(role) || "FINANCE_OFFICER".equalsIgnoreCase(role) || "LOGISTICS_MANAGER".equalsIgnoreCase(role)) {
            exp = staffExpiration;
        }

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + exp))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Boolean validateToken(String token, String userEmail) {
        final String username = extractUsername(token);
        return (username.equals(userEmail) && !isTokenExpired(token));
    }

    private Boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }
}
