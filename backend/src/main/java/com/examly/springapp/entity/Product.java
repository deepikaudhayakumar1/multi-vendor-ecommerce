//package com.examly.springapp.entity;
//
//import jakarta.persistence.*;
//
//import java.math.BigDecimal;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//
//@Entity
//@Table(name = "products")
//public class Product {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "vendor_id", nullable = false)
//    private Long vendorId;
//
//    @Column(nullable = false, length = 300)
//    private String name;
//
//    @Column(length = 100)
//    private String category;
//
//    @Column(columnDefinition = "TEXT")
//    private String description;
//
//    @Column(nullable = false, precision = 10, scale = 2)
//    private BigDecimal mrp;
//
//    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
//    private BigDecimal sellingPrice;
//
//    @Column(nullable = false)
//    private Integer stock;
//
//    @Column(name = "gst_rate", precision = 4, scale = 2)
//    private BigDecimal gstRate;
//
//    @Column(length = 30)
//    private String status;
//
//    @Column(name = "created_date")
//    private LocalDateTime createdDate;
//
//    /*
//     * Multiple images for one product.
//     *
//     * Example:
//     * /uploads/abc.jpg
//     * /uploads/xyz.jpg
//     * /uploads/pqr.jpg
//     */
//    @ElementCollection
//    @CollectionTable(
//            name = "product_images",
//            joinColumns = @JoinColumn(name = "product_id")
//    )
//    @Column(name = "image_url", nullable = false)
//    private List<String> imageUrls = new ArrayList<>();
//
//
//    public Product() {
//    }
//
//
//    @PrePersist
//    public void onCreate() {
//        if (createdDate == null) {
//            createdDate = LocalDateTime.now();
//        }
//
//        if (status == null) {
//            status = "PENDING_REVIEW";
//        }
//    }
//
//
//    public Long getId() {
//        return id;
//    }
//
//    public void setId(Long id) {
//        this.id = id;
//    }
//
//
//    public Long getVendorId() {
//        return vendorId;
//    }
//
//    public void setVendorId(Long vendorId) {
//        this.vendorId = vendorId;
//    }
//
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//
//    public String getCategory() {
//        return category;
//    }
//
//    public void setCategory(String category) {
//        this.category = category;
//    }
//
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
//
//    public BigDecimal getMrp() {
//        return mrp;
//    }
//
//    public void setMrp(BigDecimal mrp) {
//        this.mrp = mrp;
//    }
//
//
//    public BigDecimal getSellingPrice() {
//        return sellingPrice;
//    }
//
//    public void setSellingPrice(BigDecimal sellingPrice) {
//        this.sellingPrice = sellingPrice;
//    }
//
//
//    public Integer getStock() {
//        return stock;
//    }
//
//    public void setStock(Integer stock) {
//        this.stock = stock;
//    }
//
//
//    public BigDecimal getGstRate() {
//        return gstRate;
//    }
//
//    public void setGstRate(BigDecimal gstRate) {
//        this.gstRate = gstRate;
//    }
//
//
//    public String getStatus() {
//        return status;
//    }
//
//    public void setStatus(String status) {
//        this.status = status;
//    }
//
//
//    public LocalDateTime getCreatedDate() {
//        return createdDate;
//    }
//
//    public void setCreatedDate(LocalDateTime createdDate) {
//        this.createdDate = createdDate;
//    }
//
//
//    public List<String> getImageUrls() {
//        return imageUrls;
//    }
//
//    public void setImageUrls(List<String> imageUrls) {
//        this.imageUrls = imageUrls;
//    }
//}


package com.examly.springapp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "gst_rate", nullable = false, precision = 4, scale = 2)
    private BigDecimal gstRate;

    @Column(nullable = false, length = 30)
    private String status = "PENDING_REVIEW"; // DRAFT, PENDING_REVIEW, ACTIVE, SUSPENDED, DELETED

    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    private String imageUrl;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public BigDecimal getMrp() { return mrp; }
    public void setMrp(BigDecimal mrp) { this.mrp = mrp; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
