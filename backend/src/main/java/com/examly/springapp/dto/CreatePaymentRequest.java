package com.examly.springapp.dto;

public class CreatePaymentRequest {

    private Long orderId;

    public CreatePaymentRequest() {
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}