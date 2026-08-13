package com.examly.springapp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "gst_rate", nullable = false, precision = 4, scale = 2)
    private BigDecimal gstRate; // e.g. 18.00

    @Column(name = "commission_rate", nullable = false, precision = 4, scale = 2)
    private BigDecimal commissionRate; // e.g. 10.00

    @Column(name = "return_window_days")
    private Integer returnWindowDays = 7;

    public Category() {}

    public Category(Long id, String name, BigDecimal gstRate, BigDecimal commissionRate, Integer returnWindowDays) {
        this.id = id;
        this.name = name;
        this.gstRate = gstRate;
        this.commissionRate = commissionRate;
        this.returnWindowDays = returnWindowDays;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }

    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }

    public Integer getReturnWindowDays() { return returnWindowDays; }
    public void setReturnWindowDays(Integer returnWindowDays) { this.returnWindowDays = returnWindowDays; }
}
