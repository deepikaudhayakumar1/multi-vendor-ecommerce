package com.examly.springapp.service;

import com.examly.springapp.config.JwtUtil;
import com.examly.springapp.dto.AuthRequest;
import com.examly.springapp.dto.AuthResponse;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.InvalidNameException;
import com.examly.springapp.exception.InvalidPhoneException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.exception.UnauthorisedAccessException;
import com.examly.springapp.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private static final Pattern NAME_PATTERN =
            Pattern.compile("^[a-zA-Z\\s]{2,100}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[0-9]{10}$");


    // =========================================================
    // REGISTER
    // =========================================================

    public AuthResponse register(RegisterRequest request) {

        if (request.getName() == null ||
                !NAME_PATTERN.matcher(request.getName().trim()).matches()) {

            throw new InvalidNameException(
                    "Name must not contain special characters or numbers"
            );
        }

        if (request.getPhone() == null ||
                !PHONE_PATTERN.matcher(request.getPhone().trim()).matches()) {

            throw new InvalidPhoneException(
                    "Phone Number must be exactly 10 digits long"
            );
        }

        if (userRepository.existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "This email is already registered"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().length() < 8) {

            throw new IllegalArgumentException(
                    "Password must meet security requirements"
            );
        }

        User user = new User();

        user.setName(request.getName().trim());

        user.setEmail(
                request.getEmail().trim().toLowerCase()
        );

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(
                request.getPhone().trim()
        );

        user.setRole(
                request.getRole() != null
                        ? request.getRole().toUpperCase()
                        : "CUSTOMER"
        );

        user.setGstin(request.getGstin());
        user.setPan(request.getPan());
        user.setBankAccountNo(request.getBankAccountNo());
        user.setIfscCode(request.getIfscCode());

        // New users should be ACTIVE by default
        user.setStatus("ACTIVE");

        userRepository.save(user);

        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(
                token,
                "Registration successful! Please verify your email.",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public AuthResponse login(AuthRequest request) {

        // 1. Find user by email
        User user = userRepository
                .findByEmail(
                        request.getEmail().trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new UnauthorisedAccessException(
                                "Invalid credentials. Please check your email and password."
                        )
                );


        // 2. Check password
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new UnauthorisedAccessException(
                    "Invalid credentials. Please check your email and password."
            );
        }


        // 3. IMPORTANT:
        // Check whether Admin has suspended the account
        if ("SUSPENDED".equalsIgnoreCase(user.getStatus())) {

            throw new UnauthorisedAccessException(
                    "Your account has been suspended. Please contact the administrator."
            );
        }


        // 4. Only ACTIVE users can receive JWT
        String token = jwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole()
        );


        // 5. Return successful login response
        return new AuthResponse(
                token,
                "Login successful",
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }


    // =========================================================
    // GET PROFILE
    // =========================================================

    public User getProfile(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User profile not found"
                        )
                );
    }


    // =========================================================
    // GET ALL USERS
    // =========================================================

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }


    // =========================================================
    // UPDATE USER STATUS
    // ADMIN -> SUSPEND / ACTIVATE
    // =========================================================

    public User updateUserStatus(Long userId, String status) {

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + userId
                        )
                );

        user.setStatus(status.toUpperCase());

        return userRepository.save(user);
    }
}




//package com.examly.springapp.service;
//import com.examly.springapp.config.JwtUtil;
//import com.examly.springapp.dto.AuthRequest;
//import com.examly.springapp.dto.AuthResponse;
//import com.examly.springapp.dto.RegisterRequest;
//import com.examly.springapp.entity.User;
//import com.examly.springapp.exception.InvalidNameException;
//import com.examly.springapp.exception.InvalidPhoneException;
//import com.examly.springapp.exception.ResourceNotFoundException;
//import com.examly.springapp.exception.UnauthorisedAccessException;
//import com.examly.springapp.repository.UserRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//import java.util.regex.Pattern;
//@Service
//public class AuthService {
//    @Autowired
//    private UserRepository userRepository;
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//    @Autowired
//    private JwtUtil jwtUtil;
//    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z\\s]{2,100}$");
//    private static final Pattern PHONE_PATTERN = Pattern.compile("^[0-9]{10}$");
//    public AuthResponse register(RegisterRequest request) {
//        if (request.getName() == null || !NAME_PATTERN.matcher(request.getName().trim()).matches()) {
//            throw new InvalidNameException("Name must not contain special characters or numbers");
//        }
//        if (request.getPhone() == null || !PHONE_PATTERN.matcher(request.getPhone().trim()).matches()) {
//            throw new InvalidPhoneException("Phone Number must be exactly 10 digits long");
//        }
//        if (userRepository.existsByEmail(request.getEmail())) {
//            throw new IllegalArgumentException("This email is already registered");
//        }
//        if (request.getPassword() == null || request.getPassword().length() < 8) {
//            throw new IllegalArgumentException("Password must meet security requirements");
//        }
//        User user = new User();
//        user.setName(request.getName().trim());
//        user.setEmail(request.getEmail().trim().toLowerCase());
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        user.setPhone(request.getPhone().trim());
//        user.setRole(request.getRole() != null ? request.getRole().toUpperCase() : "CUSTOMER");
//        user.setGstin(request.getGstin());
//        user.setPan(request.getPan());
//        user.setBankAccountNo(request.getBankAccountNo());
//        user.setIfscCode(request.getIfscCode());
//        userRepository.save(user);
//        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
//        return new AuthResponse(token, "Registration successful! Please verify your email.", user.getId(), user.getEmail(), user.getName(), user.getRole());
//    }
//    public AuthResponse login(AuthRequest request) {
//        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
//                .orElseThrow(() -> new UnauthorisedAccessException("Invalid credentials. Please check your email and password."));
//        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
//            throw new UnauthorisedAccessException("Invalid credentials. Please check your email and password.");
//        }
//        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
//        return new AuthResponse(token, "Login successful", user.getId(), user.getEmail(), user.getName(), user.getRole());
//    }
//    public User getProfile(String email) {
//        return userRepository.findByEmail(email)
//                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));
//    }
//    public List<User> getAllUsers() {
//        return userRepository.findAll();
//    }
//    public User updateUserStatus(Long userId, String status) {
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
//        user.setStatus(status);
//        return userRepository.save(user);
//    }
//}
