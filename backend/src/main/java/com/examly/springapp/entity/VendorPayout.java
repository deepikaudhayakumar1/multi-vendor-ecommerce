package com.examly.springapp.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "vendor_payouts")
public class VendorPayout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vendor_id", nullable = false)
    private Long vendorId;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "gross_sales", precision = 12, scale = 2)
    private BigDecimal grossSales;

    @Column(name = "commission_deducted", precision = 10, scale = 2)
    private BigDecimal commissionDeducted;

    @Column(name = "tds_deducted", precision = 8, scale = 2)
    private BigDecimal tdsDeducted;

    @Column(name = "net_payout", precision = 12, scale = 2)
    private BigDecimal netPayout;

    @Column(name = "payout_status", nullable = false, length = 30)
    private String payoutStatus = "PENDING"; // PENDING, PROCESSING, PAID

    @Column(name = "utr_number", length = 50)
    private String utrNumber;

    public VendorPayout() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVendorId() { return vendorId; }
    public void setVendorId(Long vendorId) { this.vendorId = vendorId; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public BigDecimal getGrossSales() { return grossSales; }
    public void setGrossSales(BigDecimal grossSales) { this.grossSales = grossSales; }

    public BigDecimal getCommissionDeducted() { return commissionDeducted; }
    public void setCommissionDeducted(BigDecimal commissionDeducted) { this.commissionDeducted = commissionDeducted; }

    public BigDecimal getTdsDeducted() { return tdsDeducted; }
    public void setTdsDeducted(BigDecimal tdsDeducted) { this.tdsDeducted = tdsDeducted; }

    public BigDecimal getNetPayout() { return netPayout; }
    public void setNetPayout(BigDecimal netPayout) { this.netPayout = netPayout; }

    public String getPayoutStatus() { return payoutStatus; }
    public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }
}
