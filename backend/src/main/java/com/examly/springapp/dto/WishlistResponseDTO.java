package com.examly.springapp.dto;

import java.math.BigDecimal;

public class WishlistResponseDTO {

    private Long id;

    private Long productId;
    private String name;
    private String description;

    private BigDecimal basePrice;
    private BigDecimal mrp;

    private Integer stock;
    private String status;
    private String imageUrl;

    public WishlistResponseDTO() {
    }

    public WishlistResponseDTO(
            Long id,
            Long productId,
            String name,
            String description,
            BigDecimal basePrice,
            BigDecimal mrp,
            Integer stock,
            String status,
            String imageUrl
    ) {
        this.id = id;
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.basePrice = basePrice;
        this.mrp = mrp;
        this.stock = stock;
        this.status = status;
        this.imageUrl = imageUrl;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public BigDecimal getMrp() {
        return mrp;
    }

    public void setMrp(BigDecimal mrp) {
        this.mrp = mrp;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}