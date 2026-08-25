package com.examly.springapp.controller;

import com.examly.springapp.dto.CreatePaymentRequest;
import com.examly.springapp.dto.PaymentResponse;
import com.examly.springapp.dto.PaymentVerificationRequest;
import com.examly.springapp.entity.Payment;
import com.examly.springapp.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Create Razorpay order
     *
     * POST /api/payments/create-order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(
            @RequestBody CreatePaymentRequest request
    ) {

        try {

            PaymentResponse response =
                    paymentService.createPaymentOrder(request);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(errorResponse(e.getMessage()));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(
                            "Unable to create Razorpay order: "
                                    + e.getMessage()
                    ));
        }
    }

    /**
     * Verify Razorpay payment
     *
     * POST /api/payments/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request
    ) {

        try {

            PaymentResponse response =
                    paymentService.verifyPayment(request);

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse(
                            "Payment verification failed"
                    ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(errorResponse(e.getMessage()));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse(
                            "Unable to verify payment: "
                                    + e.getMessage()
                    ));
        }
    }

    /**
     * Get payment by ecommerce order ID
     *
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(
            @PathVariable Long orderId
    ) {

        Optional<Payment> payment =
                paymentService.getPaymentByOrderId(orderId);

        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorResponse(
                        "Payment not found for order " + orderId
                ));
    }

    private Map<String, String> errorResponse(
            String message
    ) {

        Map<String, String> error =
                new HashMap<>();

        error.put("error", message);

        return error;
    }
}