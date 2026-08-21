package com.examly.springapp.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 10)
    private String phone;

    @Column(nullable = false, length = 30)
    private String role;

    // =========================================================
    // VENDOR / BUSINESS INFORMATION
    // =========================================================

    private String gstin;

    private String pan;

    private String bankAccountNo;

    private String ifscCode;

    // =========================================================
    // ADDRESS INFORMATION
    // =========================================================

    @Column(length = 255)
    private String addressLine1;

    @Column(length = 255)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(length = 100)
    private String country = "India";

    // =========================================================
    // ACCOUNT INFORMATION
    // =========================================================

    private String status = "ACTIVE";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public User() {
    }

    public User(
            Long id,
            String name,
            String email,
            String password,
            String phone,
            String role
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getGstin() {
        return gstin;
    }

    public void setGstin(String gstin) {
        this.gstin = gstin;
    }

    public String getPan() {
        return pan;
    }

    public void setPan(String pan) {
        this.pan = pan;
    }

    public String getBankAccountNo() {
        return bankAccountNo;
    }

    public void setBankAccountNo(String bankAccountNo) {
        this.bankAccountNo = bankAccountNo;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getAddressLine1() {
        return addressLine1;
    }

    public void setAddressLine1(String addressLine1) {
        this.addressLine1 = addressLine1;
    }

    public String getAddressLine2() {
        return addressLine2;
    }

    public void setAddressLine2(String addressLine2) {
        this.addressLine2 = addressLine2;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}



//package com.examly.springapp.entity;
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//@Entity
//@Table(name = "users")
//public class User {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//    @Column(nullable = false, length = 100)
//    private String name;
//    @Column(nullable = false, unique = true, length = 100)
//    private String email;
//    @Column(nullable = false)
//    private String password;
//    @Column(nullable = false, length = 10)
//    private String phone;
//    @Column(nullable = false, length = 30)
//    private String role; // ADMIN, VENDOR, CUSTOMER, CATEGORY_MANAGER, FINANCE_OFFICER, LOGISTICS_MANAGER
//    private String gstin;
//    private String pan;
//    private String bankAccountNo;
//    private String ifscCode;
//    private String status = "ACTIVE"; // ACTIVE, SUSPENDED, PENDING_VERIFICATION
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt = LocalDateTime.now();
//    public User() {}
//    public User(Long id, String name, String email, String password, String phone, String role) {
//        this.id = id;
//        this.name = name;
//        this.email = email;
//        this.password = password;
//        this.phone = phone;
//        this.role = role;
//    }
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//    public String getName() { return name; }
//    public void setName(String name) { this.name = name; }
//    public String getEmail() { return email; }
//    public void setEmail(String email) { this.email = email; }
//    public String getPassword() { return password; }
//    public void setPassword(String password) { this.password = password; }
//    public String getPhone() { return phone; }
//    public void setPhone(String phone) { this.phone = phone; }
//    public String getRole() { return role; }
//    public void setRole(String role) { this.role = role; }
//    public String getGstin() { return gstin; }
//    public void setGstin(String gstin) { this.gstin = gstin; }
//    public String getPan() { return pan; }
//    public void setPan(String pan) { this.pan = pan; }
//    public String getBankAccountNo() { return bankAccountNo; }
//    public void setBankAccountNo(String bankAccountNo) { this.bankAccountNo = bankAccountNo; }
//    public String getIfscCode() { return ifscCode; }
//    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//}
