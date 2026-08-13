package com.examly.springapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("paymentSessionId", "PAY_SESS_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.put("status", "INITIATED");
        response.put("amount", request.get("amount"));
        response.put("method", request.get("method"));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", id);
        response.put("status", "SUCCESS");
        response.put("gatewayRef", "TXN_" + System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
