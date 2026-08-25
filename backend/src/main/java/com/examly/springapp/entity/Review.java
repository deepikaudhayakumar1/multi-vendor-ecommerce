package com.examly.springapp.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_review_customer_product",
                        columnNames = {"customer_id", "product_id"}
                )
        }
)
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "verified_purchase", nullable = false)
    private Boolean verifiedPurchase = true;

    @Column(name = "vendor_reply", columnDefinition = "TEXT")
    private String vendorReply;

    @ElementCollection
    @CollectionTable(
            name = "review_images",
            joinColumns = @JoinColumn(name = "review_id")
    )
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getReviewText() {
        return reviewText;
    }

    public void setReviewText(String reviewText) {
        this.reviewText = reviewText;
    }

    public Boolean getVerifiedPurchase() {
        return verifiedPurchase;
    }

    public void setVerifiedPurchase(Boolean verifiedPurchase) {
        this.verifiedPurchase = verifiedPurchase;
    }

    public String getVendorReply() {
        return vendorReply;
    }

    public void setVendorReply(String vendorReply) {
        this.vendorReply = vendorReply;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}




//package com.examly.springapp.entity;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "reviews")
//public class Review {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "product_id", nullable = false)
//    private Long productId;
//
//    @Column(name = "customer_id", nullable = false)
//    private Long customerId;
//
//    @Column(nullable = false)
//    private Integer rating; // 1 to 5
//
//    @Column(length = 200)
//    private String title;
//
//    @Column(columnDefinition = "TEXT")
//    private String reviewText;
//
//    @Column(name = "verified_purchase")
//    private Boolean verifiedPurchase = true;
//
//    @Column(name = "vendor_reply", columnDefinition = "TEXT")
//    private String vendorReply;
//
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    public Review() {}
//
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public Long getProductId() { return productId; }
//    public void setProductId(Long productId) { this.productId = productId; }
//
//    public Long getCustomerId() { return customerId; }
//    public void setCustomerId(Long customerId) { this.customerId = customerId; }
//
//    public Integer getRating() { return rating; }
//    public void setRating(Integer rating) { this.rating = rating; }
//
//    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }
//
//    public String getReviewText() { return reviewText; }
//    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
//
//    public Boolean getVerifiedPurchase() { return verifiedPurchase; }
//    public void setVerifiedPurchase(Boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }
//
//    public String getVendorReply() { return vendorReply; }
//    public void setVendorReply(String vendorReply) { this.vendorReply = vendorReply; }
//
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//}
