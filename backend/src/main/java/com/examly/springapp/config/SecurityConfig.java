package com.examly.springapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // ==========================================
                // CORS
                // ==========================================
                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                // ==========================================
                // CSRF
                // ==========================================
                .csrf(AbstractHttpConfigurer::disable)

                // ==========================================
                // AUTHORIZATION
                // ==========================================
                .authorizeHttpRequests(auth -> auth

                        // ----------------------------------
                        // Authentication APIs
                        // ----------------------------------
                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()


                        // ----------------------------------
                        // H2 console
                        // ----------------------------------
                        .requestMatchers(
                                "/h2-console/**"
                        ).permitAll()


                        // ----------------------------------
                        // Uploaded product images
                        // ----------------------------------
                        .requestMatchers(
                                "/uploads/**"
                        ).permitAll()


                        // ----------------------------------
                        // Public GET APIs
                        // ----------------------------------
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products/**",
                                "/api/categories/**"
                        ).permitAll()


                        // ----------------------------------
                        // Everything else requires JWT
                        // ----------------------------------
                        .anyRequest().authenticated()
                )


                // ==========================================
                // STATELESS SESSION
                // ==========================================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // ==========================================
                // H2 FRAME OPTIONS
                // ==========================================
                .headers(headers ->
                        headers.frameOptions(frame ->
                                frame.sameOrigin()
                        )
                )


                // ==========================================
                // JWT FILTER
                // ==========================================
                .addFilterBefore(
                        jwtAuthFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    // ======================================================
    // PASSWORD ENCODER
    // ======================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ======================================================
    // CORS CONFIGURATION
    // ======================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();


        // Allow frontend
        config.setAllowedOriginPatterns(
                List.of("*")
        );


        // HTTP methods
        config.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS",
                        "PATCH"
                )
        );


        // Headers
        config.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "X-Requested-With"
                )
        );


        // Allow cookies/credentials
        config.setAllowCredentials(true);


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                config
        );


        return source;
    }
}

