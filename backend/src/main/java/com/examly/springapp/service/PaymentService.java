package com.examly.springapp.service;

import com.examly.springapp.dto.CreatePaymentRequest;
import com.examly.springapp.dto.PaymentResponse;
import com.examly.springapp.dto.PaymentVerificationRequest;
import com.examly.springapp.entity.Order;
import com.examly.springapp.entity.Payment;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            OrderService orderService
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    // ============================================================
    // CREATE RAZORPAY ORDER
    // ============================================================

    @Transactional
    public PaymentResponse createPaymentOrder(
            CreatePaymentRequest request
    ) throws Exception {

        if (request == null || request.getOrderId() == null) {
            throw new IllegalArgumentException(
                    "Order ID is required"
            );
        }

        Long orderId = request.getOrderId();

        // Find ecommerce order
        Order ecommerceOrder = orderRepository
                .findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with ID: " + orderId
                        )
                );

        // Don't create payment for already paid order
        if ("PAID".equalsIgnoreCase(
                ecommerceOrder.getPaymentStatus())) {

            throw new IllegalStateException(
                    "Order is already paid"
            );
        }

        // Get amount from database
        BigDecimal amount =
                ecommerceOrder.getTotalAmount();

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Order amount must be greater than zero"
            );
        }

        // Check existing Razorpay order
        Optional<Payment> existingPayment =
                paymentRepository.findByOrderId(orderId);

        if (existingPayment.isPresent() &&
                "CREATED".equalsIgnoreCase(
                        existingPayment.get().getStatus())) {

            Payment existing = existingPayment.get();

            return new PaymentResponse(
                    orderId,
                    existing.getRazorpayOrderId(),
                    razorpayKeyId,
                    existing.getAmount(),
                    existing.getCurrency(),
                    existing.getStatus(),
                    "Existing Razorpay order returned"
            );
        }

        // Convert INR to paise
        long amountInPaise =
                amount
                        .multiply(new BigDecimal("100"))
                        .setScale(
                                0,
                                RoundingMode.HALF_UP
                        )
                        .longValueExact();

        // Create Razorpay client
        RazorpayClient razorpayClient =
                new RazorpayClient(
                        razorpayKeyId,
                        razorpayKeySecret
                );

        // Razorpay order options
        JSONObject options = new JSONObject();

        options.put(
                "amount",
                amountInPaise
        );

        options.put(
                "currency",
                "INR"
        );

        options.put(
                "receipt",
                "ORDER_" + orderId
        );

        // Create Razorpay order
        com.razorpay.Order razorpayOrder =
                razorpayClient.orders.create(options);

        String razorpayOrderId =
                razorpayOrder.get("id");

        // Save payment
        Payment payment = new Payment();

        payment.setOrderId(orderId);

        payment.setRazorpayOrderId(
                razorpayOrderId
        );

        payment.setAmount(amount);

        payment.setCurrency("INR");

        payment.setStatus("CREATED");

        paymentRepository.save(payment);

        return new PaymentResponse(
                orderId,
                razorpayOrderId,
                razorpayKeyId,
                amount,
                "INR",
                "CREATED",
                "Razorpay order created successfully"
        );
    }

    // ============================================================
    // VERIFY RAZORPAY PAYMENT
    // ============================================================

    @Transactional
    public PaymentResponse verifyPayment(
            PaymentVerificationRequest request
    ) throws Exception {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Payment verification data is required"
            );
        }

        if (request.getOrderId() == null ||
                request.getRazorpayOrderId() == null ||
                request.getRazorpayPaymentId() == null ||
                request.getRazorpaySignature() == null) {

            throw new IllegalArgumentException(
                    "Incomplete payment verification data"
            );
        }

        // Find payment
        Payment payment =
                paymentRepository
                        .findByRazorpayOrderId(
                                request.getRazorpayOrderId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payment record not found"
                                )
                        );

        // Check ecommerce order ID
        if (!payment.getOrderId()
                .equals(request.getOrderId())) {

            throw new IllegalArgumentException(
                    "Order ID does not match payment"
            );
        }

        // Create Razorpay signature payload
        String payload =
                request.getRazorpayOrderId()
                        + "|"
                        + request.getRazorpayPaymentId();

        // Verify signature
        boolean signatureValid =
                Utils.verifySignature(
                        payload,
                        request.getRazorpaySignature(),
                        razorpayKeySecret
                );

        // Invalid signature
        if (!signatureValid) {

            payment.setStatus("FAILED");

            paymentRepository.save(payment);

            orderService.markPaymentFailed(
                    request.getOrderId()
            );

            throw new SecurityException(
                    "Invalid Razorpay payment signature"
            );
        }

        // Payment successful
        payment.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );

        payment.setRazorpaySignature(
                request.getRazorpaySignature()
        );

        payment.setStatus("SUCCESS");

        payment.setPaidAt(
                LocalDateTime.now()
        );

        paymentRepository.save(payment);

        // Mark ecommerce order as PAID
        Order paidOrder =
                orderService.markOrderAsPaid(
                        request.getOrderId()
                );

        return new PaymentResponse(
                paidOrder.getId(),
                payment.getRazorpayOrderId(),
                razorpayKeyId,
                payment.getAmount(),
                payment.getCurrency(),
                "SUCCESS",
                "Payment verified successfully"
        );
    }

    // ============================================================
    // GET PAYMENT BY ORDER
    // ============================================================

    public Optional<Payment> getPaymentByOrderId(
            Long orderId
    ) {

        return paymentRepository
                .findByOrderId(orderId);
    }
}





//package com.examly.springapp.service;
//
//import com.examly.springapp.dto.CreatePaymentRequest;
//import com.examly.springapp.dto.PaymentResponse;
//import com.examly.springapp.dto.PaymentVerificationRequest;
//import com.examly.springapp.entity.Payment;
//import com.examly.springapp.repository.OrderRepository;
//import com.examly.springapp.repository.PaymentRepository;
//import com.razorpay.Order;
//import com.razorpay.RazorpayClient;
//import com.razorpay.Utils;
//import org.json.JSONObject;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDateTime;
//import java.util.Optional;
//
//@Service
//public class PaymentService {
//
//    private final PaymentRepository paymentRepository;
//    private final OrderRepository orderRepository;
//
//    @Value("${razorpay.key.id}")
//    private String razorpayKeyId;
//
//    @Value("${razorpay.key.secret}")
//    private String razorpayKeySecret;
//
//    public PaymentService(
//            PaymentRepository paymentRepository,
//            OrderRepository orderRepository
//    ) {
//        this.paymentRepository = paymentRepository;
//        this.orderRepository = orderRepository;
//    }
//
//    /**
//     * Create Razorpay Order
//     */
//    @Transactional
//    public PaymentResponse createPaymentOrder(CreatePaymentRequest request) throws Exception {
//
//        if (request == null || request.getOrderId() == null) {
//            throw new IllegalArgumentException("Order ID is required");
//        }
//
//        Long orderId = request.getOrderId();
//
//        /*
//         * Verify that ecommerce order exists.
//         */
//        Object ecommerceOrder = orderRepository.findById(orderId)
//                .orElseThrow(() ->
//                        new RuntimeException("Order not found with ID: " + orderId)
//                );
//
//        /*
//         * IMPORTANT:
//         *
//         * Replace this method with the exact total-price getter
//         * from your Order.java.
//         *
//         * Example:
//         *
//         * BigDecimal amount = order.getTotalAmount();
//         */
//        BigDecimal amount = getOrderAmount(ecommerceOrder);
//
//        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
//            throw new IllegalArgumentException(
//                    "Order amount must be greater than zero"
//            );
//        }
//
//        /*
//         * Convert INR to paise.
//         *
//         * Example:
//         * ₹100.00 = 10000 paise
//         */
//        long amountInPaise = amount
//                .multiply(new BigDecimal("100"))
//                .setScale(0, RoundingMode.HALF_UP)
//                .longValueExact();
//
//        RazorpayClient razorpayClient =
//                new RazorpayClient(
//                        razorpayKeyId,
//                        razorpayKeySecret
//                );
//
//        JSONObject options = new JSONObject();
//
//        options.put("amount", amountInPaise);
//        options.put("currency", "INR");
//        options.put("receipt", "ORDER_" + orderId);
//
//        Order razorpayOrder =
//                razorpayClient.orders.create(options);
//
//        String razorpayOrderId =
//                razorpayOrder.get("id");
//
//        /*
//         * Save payment information
//         */
//        Payment payment = new Payment();
//
//        payment.setOrderId(orderId);
//        payment.setRazorpayOrderId(razorpayOrderId);
//        payment.setAmount(amount);
//        payment.setCurrency("INR");
//        payment.setStatus("CREATED");
//
//        paymentRepository.save(payment);
//
//        return new PaymentResponse(
//                orderId,
//                razorpayOrderId,
//                razorpayKeyId,
//                amount,
//                "INR",
//                "CREATED",
//                "Razorpay order created successfully"
//        );
//    }
//
//    /**
//     * Verify Razorpay payment
//     */
//    @Transactional
//    public PaymentResponse verifyPayment(
//            PaymentVerificationRequest request
//    ) throws Exception {
//
//        if (request == null) {
//            throw new IllegalArgumentException(
//                    "Payment verification data is required"
//            );
//        }
//
//        if (request.getOrderId() == null ||
//                request.getRazorpayOrderId() == null ||
//                request.getRazorpayPaymentId() == null ||
//                request.getRazorpaySignature() == null) {
//
//            throw new IllegalArgumentException(
//                    "Incomplete payment verification data"
//            );
//        }
//
//        /*
//         * Find saved payment
//         */
//        Payment payment = paymentRepository
//                .findByRazorpayOrderId(
//                        request.getRazorpayOrderId()
//                )
//                .orElseThrow(() ->
//                        new RuntimeException(
//                                "Payment record not found"
//                        )
//                );
//
//        /*
//         * Make sure the payment belongs to
//         * the same ecommerce order.
//         */
//        if (!payment.getOrderId()
//                .equals(request.getOrderId())) {
//
//            throw new IllegalArgumentException(
//                    "Order ID does not match payment"
//            );
//        }
//
//        /*
//         * Razorpay signature verification
//         *
//         * Razorpay signs:
//         *
//         * razorpay_order_id + "|" + razorpay_payment_id
//         */
//        String payload =
//                request.getRazorpayOrderId()
//                        + "|"
//                        + request.getRazorpayPaymentId();
//
//        boolean signatureValid =
//                Utils.verifySignature(
//                        payload,
//                        request.getRazorpaySignature(),
//                        razorpayKeySecret
//                );
//
//        if (!signatureValid) {
//
//            payment.setStatus("FAILED");
//
//            paymentRepository.save(payment);
//
//            throw new SecurityException(
//                    "Invalid Razorpay payment signature"
//            );
//        }
//
//        /*
//         * Payment is successfully verified.
//         */
//        payment.setRazorpayPaymentId(
//                request.getRazorpayPaymentId()
//        );
//
//        payment.setRazorpaySignature(
//                request.getRazorpaySignature()
//        );
//
//        payment.setStatus("SUCCESS");
//
//        payment.setPaidAt(LocalDateTime.now());
//
//        paymentRepository.save(payment);
//
//        /*
//         * IMPORTANT:
//         *
//         * Your existing Order entity probably has
//         * a status field.
//         *
//         * Once I see your exact Order.java,
//         * we should update:
//         *
//         * PAYMENT_PENDING -> PAID
//         *
//         * here.
//         */
//
//        return new PaymentResponse(
//                request.getOrderId(),
//                request.getRazorpayOrderId(),
//                razorpayKeyId,
//                payment.getAmount(),
//                "INR",
//                "SUCCESS",
//                "Payment verified successfully"
//        );
//    }
//
//    /**
//     * Get payment by ecommerce order ID
//     */
//    public Optional<Payment> getPaymentByOrderId(Long orderId) {
//
//        return paymentRepository.findByOrderId(orderId);
//    }
//
//    /**
//     * Get amount from ecommerce Order.
//     *
//     * IMPORTANT:
//     * Replace this implementation with your actual
//     * Order.java getter.
//     */
//    private BigDecimal getOrderAmount(Object order) {
//
//        try {
//
//            /*
//             * Reflection is being used temporarily so this
//             * new file doesn't assume the exact name of your
//             * existing Order amount field.
//             *
//             * Common names:
//             *
//             * getTotalAmount()
//             * getTotal()
//             * getGrandTotal()
//             */
//
//            try {
//                Object value =
//                        order.getClass()
//                                .getMethod("getTotalAmount")
//                                .invoke(order);
//
//                if (value instanceof BigDecimal) {
//                    return (BigDecimal) value;
//                }
//
//                if (value instanceof Number) {
//                    return BigDecimal.valueOf(
//                            ((Number) value).doubleValue()
//                    );
//                }
//            } catch (NoSuchMethodException ignored) {
//            }
//
//            try {
//                Object value =
//                        order.getClass()
//                                .getMethod("getGrandTotal")
//                                .invoke(order);
//
//                if (value instanceof BigDecimal) {
//                    return (BigDecimal) value;
//                }
//
//                if (value instanceof Number) {
//                    return BigDecimal.valueOf(
//                            ((Number) value).doubleValue()
//                    );
//                }
//            } catch (NoSuchMethodException ignored) {
//            }
//
//            try {
//                Object value =
//                        order.getClass()
//                                .getMethod("getTotal")
//                                .invoke(order);
//
//                if (value instanceof BigDecimal) {
//                    return (BigDecimal) value;
//                }
//
//                if (value instanceof Number) {
//                    return BigDecimal.valueOf(
//                            ((Number) value).doubleValue()
//                    );
//                }
//            } catch (NoSuchMethodException ignored) {
//            }
//
//        } catch (Exception e) {
//
//            throw new RuntimeException(
//                    "Unable to read order amount",
//                    e
//            );
//        }
//
//        throw new RuntimeException(
//                "Could not find total amount field in Order.java. " +
//                        "Please connect PaymentService to your actual Order amount getter."
//        );
//    }
//}