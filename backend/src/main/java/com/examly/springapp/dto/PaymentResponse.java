package com.examly.springapp.dto;

import java.math.BigDecimal;

public class PaymentResponse {

    private Long orderId;

    private String razorpayOrderId;

    private String keyId;

    private BigDecimal amount;

    private String currency;

    private String status;

    private String message;

    public PaymentResponse() {
    }

    public PaymentResponse(
            Long orderId,
            String razorpayOrderId,
            String keyId,
            BigDecimal amount,
            String currency,
            String status,
            String message
    ) {
        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.message = message;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}