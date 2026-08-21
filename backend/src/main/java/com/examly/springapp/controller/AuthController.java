package com.examly.springapp.controller;

import com.examly.springapp.dto.AuthRequest;
import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.ProfileUpdateRequest;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.entity.User;
import com.examly.springapp.service.AuthService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;


    // =========================================================
    // REGISTER
    // =========================================================

    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(
            @RequestBody RegisterRequest request
    ) {

        AuthResponse response =
                authService.register(request);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // LOGIN
    // =========================================================

    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody AuthRequest request
    ) {

        AuthResponse response =
                authService.login(request);

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // LOGOUT
    // =========================================================

    @PostMapping("/auth/logout")
    public ResponseEntity<Map<String, String>> logout() {

        Map<String, String> response =
                new HashMap<>();

        response.put(
                "message",
                "Logged out successfully. JWT token invalidated."
        );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET CURRENT USER PROFILE
    // =========================================================

    @GetMapping("/users/profile")
    public ResponseEntity<User> getProfile(
            Authentication authentication
    ) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        User user =
                authService.getProfile(
                        authentication.getName()
                );

        return ResponseEntity.ok(user);
    }


    // =========================================================
    // UPDATE CURRENT USER PROFILE
    // =========================================================

    @PutMapping("/users/profile")
    public ResponseEntity<User> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request
    ) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        User updatedUser =
                authService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(updatedUser);
    }
}






//package com.examly.springapp.controller;
//import com.examly.springapp.dto.AuthRequest;
//import com.examly.springapp.dto.AuthResponse;
//import com.examly.springapp.dto.RegisterRequest;
//import com.examly.springapp.entity.User;
//import com.examly.springapp.service.AuthService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.Map;
//@RestController
//@RequestMapping("/api")
//@CrossOrigin(origins = "*")
//public class AuthController {
//    @Autowired
//    private AuthService authService;
//    @PostMapping("/auth/register")
//    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
//        AuthResponse response = authService.register(request);
//        return ResponseEntity.ok(response);
//    }
//    @PostMapping("/auth/login")
//    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
//        AuthResponse response = authService.login(request);
//        return ResponseEntity.ok(response);
//    }
//    @PostMapping("/auth/logout")
//    public ResponseEntity<Map<String, String>> logout() {
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Logged out successfully. JWT token invalidated.");
//        return ResponseEntity.ok(response);
//    }
//    @GetMapping("/users/profile")
//    public ResponseEntity<User> getProfile(Authentication authentication) {
//        if (authentication == null) {
//            return ResponseEntity.status(401).build();
//        }
//        User user = authService.getProfile(authentication.getName());
//        return ResponseEntity.ok(user);
//    }
//}
