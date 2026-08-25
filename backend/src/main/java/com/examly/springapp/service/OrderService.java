package com.examly.springapp.service;

import com.examly.springapp.dto.OrderItemRequest;
import com.examly.springapp.dto.OrderRequest;
import com.examly.springapp.entity.Category;
import com.examly.springapp.entity.Order;
import com.examly.springapp.entity.OrderItem;
import com.examly.springapp.entity.Product;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.repository.OrderItemRepository;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // ============================================================
    // CREATE ORDER
    // ============================================================

    @Transactional
    public Order createOrder(OrderRequest request) {

        if (request.getItems() == null ||
                request.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Order must contain at least one item"
            );
        }

        if (request.getCustomerId() == null) {

            throw new IllegalArgumentException(
                    "Customer ID is required"
            );
        }

        if (request.getDeliveryAddress() == null ||
                request.getDeliveryAddress().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Delivery address is required"
            );
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        List<OrderItem> itemsToSave =
                new ArrayList<>();


        // ========================================================
        // PROCESS EACH PRODUCT
        // ========================================================

        for (OrderItemRequest itemReq :
                request.getItems()) {

            Product product =
                    productRepository.findById(
                            itemReq.getProductId()
                    ).orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Product not found with id: "
                                            + itemReq.getProductId()
                            )
                    );


            // ----------------------------------------------------
            // QUANTITY VALIDATION
            // ----------------------------------------------------

            if (itemReq.getQuantity() <= 0) {

                throw new IllegalArgumentException(
                        "Quantity must be greater than zero"
                );
            }


            if (itemReq.getQuantity() >
                    product.getStock()) {

                throw new IllegalArgumentException(
                        "Quantity must not exceed available stock"
                );
            }


            // ----------------------------------------------------
            // DEDUCT STOCK
            // ----------------------------------------------------

            product.setStock(
                    product.getStock()
                            - itemReq.getQuantity()
            );

            productRepository.save(product);


            // ----------------------------------------------------
            // ITEM TOTAL
            // ----------------------------------------------------

            BigDecimal itemTotal =
                    product.getBasePrice()
                            .multiply(
                                    BigDecimal.valueOf(
                                            itemReq.getQuantity()
                                    )
                            );

            totalAmount =
                    totalAmount.add(itemTotal);


            // ----------------------------------------------------
            // GST
            // ----------------------------------------------------

            BigDecimal gstRate =
                    product.getGstRate() != null
                            ? product.getGstRate()
                            : new BigDecimal("18.00");

            BigDecimal gstAmount =
                    itemTotal
                            .multiply(gstRate)
                            .divide(
                                    new BigDecimal("100"),
                                    2,
                                    RoundingMode.HALF_UP
                            );


            // ----------------------------------------------------
            // COMMISSION
            // ----------------------------------------------------

            BigDecimal commissionRate =
                    new BigDecimal("10.00");

            if (product.getCategoryId() != null) {

                Category category =
                        categoryRepository
                                .findById(
                                        product.getCategoryId()
                                )
                                .orElse(null);

                if (category != null &&
                        category.getCommissionRate() != null) {

                    commissionRate =
                            category.getCommissionRate();
                }
            }


            BigDecimal commissionAmount =
                    itemTotal
                            .multiply(commissionRate)
                            .divide(
                                    new BigDecimal("100"),
                                    2,
                                    RoundingMode.HALF_UP
                            );


            // ----------------------------------------------------
            // CREATE ORDER ITEM
            // ----------------------------------------------------

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setProductId(
                    product.getId()
            );

            orderItem.setVendorId(
                    product.getVendorId()
            );

            orderItem.setQuantity(
                    itemReq.getQuantity()
            );

            orderItem.setUnitPrice(
                    product.getBasePrice()
            );

            orderItem.setGstAmount(
                    gstAmount
            );

            orderItem.setCommissionAmount(
                    commissionAmount
            );

            orderItem.setItemStatus(
                    "PENDING"
            );

            itemsToSave.add(orderItem);
        }


        // ========================================================
        // CREATE ORDER
        // ========================================================

        Order order =
                new Order();

        order.setCustomerId(
                request.getCustomerId()
        );

        order.setTotalAmount(
                totalAmount
        );


        // ========================================================
        // IMPORTANT PAYMENT CHANGE
        // ========================================================
        //
        // NEVER mark Razorpay order as PAID here.
        //
        // Razorpay payment will be verified separately.
        //

        order.setPaymentStatus(
                "PENDING"
        );


        order.setOrderStatus(
                "PLACED"
        );

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );


        order.setPaymentMethod(
                request.getPaymentMethod() != null
                        ? request.getPaymentMethod()
                        : "RAZORPAY"
        );


        // ========================================================
        // SAVE ORDER
        // ========================================================

        Order savedOrder =
                orderRepository.save(order);


        // ========================================================
        // SAVE ORDER ITEMS
        // ========================================================

        for (OrderItem item :
                itemsToSave) {

            item.setOrderId(
                    savedOrder.getId()
            );

            orderItemRepository.save(item);
        }


        return savedOrder;
    }


    // ============================================================
    // GET ORDER
    // ============================================================

    public Order getOrderById(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Order not found with id: "
                                        + id
                        )
                );
    }


    // ============================================================
    // CUSTOMER ORDERS
    // ============================================================

    public List<Order> getOrdersByCustomer(
            Long customerId
    ) {

        return orderRepository
                .findByCustomerId(customerId);
    }


    // ============================================================
    // VENDOR ORDER ITEMS
    // ============================================================

    public List<OrderItem> getOrderItemsByVendor(
            Long vendorId
    ) {

        return orderItemRepository
                .findByVendorId(vendorId);
    }


    // ============================================================
    // CONFIRM ORDER
    // ============================================================

    public Order confirmOrder(Long id) {

        Order order =
                getOrderById(id);

        order.setOrderStatus(
                "CONFIRMED"
        );

        return orderRepository.save(order);
    }


    // ============================================================
    // SHIP ORDER
    // ============================================================

    public Order shipOrder(Long id) {

        Order order =
                getOrderById(id);

        order.setOrderStatus(
                "SHIPPED"
        );

        order.setAwbNumber(
                "AWB-" +
                        UUID.randomUUID()
                                .toString()
                                .substring(
                                        0,
                                        8
                                )
                                .toUpperCase()
        );

        return orderRepository.save(order);
    }


    // ============================================================
    // SHIP INDIVIDUAL ORDER ITEM
    // ============================================================

    public OrderItem shipOrderItem(
            Long itemId
    ) {

        OrderItem item =
                orderItemRepository
                        .findById(itemId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Order item not found with id: "
                                                + itemId
                                )
                        );


        if ("SHIPPED".equalsIgnoreCase(
                item.getItemStatus())) {

            return item;
        }


        if ("DELIVERED".equalsIgnoreCase(
                item.getItemStatus())) {

            throw new IllegalStateException(
                    "Delivered order item cannot be marked as shipped"
            );
        }


        if ("RETURNED".equalsIgnoreCase(
                item.getItemStatus())) {

            throw new IllegalStateException(
                    "Returned order item cannot be marked as shipped"
            );
        }


        item.setItemStatus(
                "SHIPPED"
        );

        return orderItemRepository.save(
                item
        );
    }


    // ============================================================
    // DELIVER ORDER
    // ============================================================

    public Order deliverOrder(Long id) {

        Order order =
                getOrderById(id);

        order.setOrderStatus(
                "DELIVERED"
        );

        order.setDeliveredAt(
                LocalDateTime.now()
        );


        List<OrderItem> items =
                orderItemRepository
                        .findByOrderId(id);


        for (OrderItem item :
                items) {

            item.setItemStatus(
                    "DELIVERED"
            );

            orderItemRepository.save(
                    item
            );
        }


        return orderRepository.save(
                order
        );
    }


    // ============================================================
    // RETURN ORDER
    // ============================================================

    public Order returnOrder(Long id) {

        Order order =
                getOrderById(id);

        order.setOrderStatus(
                "RETURNED"
        );


        List<OrderItem> items =
                orderItemRepository
                        .findByOrderId(id);


        for (OrderItem item :
                items) {

            item.setItemStatus(
                    "RETURNED"
            );

            orderItemRepository.save(
                    item
            );
        }


        return orderRepository.save(
                order
        );
    }


    // ============================================================
    // MARK ORDER AS PAID
    // ============================================================
    //
    // Called ONLY after Razorpay signature verification.
    //

    @Transactional
    public Order markOrderAsPaid(
            Long orderId
    ) {

        Order order =
                getOrderById(orderId);


        // Already paid
        if ("PAID".equalsIgnoreCase(
                order.getPaymentStatus())) {

            return order;
        }


        // Prevent invalid payment state
        if ("REFUNDED".equalsIgnoreCase(
                order.getPaymentStatus())) {

            throw new IllegalStateException(
                    "Refunded order cannot be marked as paid"
            );
        }


        order.setPaymentStatus(
                "PAID"
        );


        /*
         * Keep order status as PLACED.
         *
         * Your existing admin/vendor flow can
         * later move it to CONFIRMED.
         */

        return orderRepository.save(
                order
        );
    }


    // ============================================================
    // MARK PAYMENT FAILED
    // ============================================================

    @Transactional
    public Order markPaymentFailed(
            Long orderId
    ) {

        Order order =
                getOrderById(orderId);

        order.setPaymentStatus(
                "FAILED"
        );

        return orderRepository.save(
                order
        );
    }
}








//package com.examly.springapp.service;
//
//import com.examly.springapp.dto.OrderItemRequest;
//import com.examly.springapp.dto.OrderRequest;
//import com.examly.springapp.entity.Category;
//import com.examly.springapp.entity.Order;
//import com.examly.springapp.entity.OrderItem;
//import com.examly.springapp.entity.Product;
//import com.examly.springapp.exception.ResourceNotFoundException;
//import com.examly.springapp.repository.CategoryRepository;
//import com.examly.springapp.repository.OrderItemRepository;
//import com.examly.springapp.repository.OrderRepository;
//import com.examly.springapp.repository.ProductRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDateTime;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class OrderService {
//
//    @Autowired
//    private OrderRepository orderRepository;
//
//    @Autowired
//    private OrderItemRepository orderItemRepository;
//
//    @Autowired
//    private ProductRepository productRepository;
//
//    @Autowired
//    private CategoryRepository categoryRepository;
//
//    public Order createOrder(OrderRequest request) {
//        if (request.getItems() == null || request.getItems().isEmpty()) {
//            throw new IllegalArgumentException("Order must contain at least one item");
//        }
//
//        BigDecimal totalAmount = BigDecimal.ZERO;
//        List<OrderItem> itemsToSave = new ArrayList<>();
//
//        for (OrderItemRequest itemReq : request.getItems()) {
//
//            Product product = productRepository.findById(itemReq.getProductId())
//                    .orElseThrow(() -> new ResourceNotFoundException(
//                            "Product not found with id: " + itemReq.getProductId()
//                    ));
//
//            if (itemReq.getQuantity() > product.getStock()) {
//                throw new IllegalArgumentException(
//                        "Quantity must not exceed available stock"
//                );
//            }
//
//            // Deduct stock
//            product.setStock(product.getStock() - itemReq.getQuantity());
//            productRepository.save(product);
//
//            BigDecimal itemTotal = product.getBasePrice()
//                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
//
//            totalAmount = totalAmount.add(itemTotal);
//
//            BigDecimal gstRate = product.getGstRate() != null
//                    ? product.getGstRate()
//                    : new BigDecimal("18.00");
//
//            BigDecimal gstAmount = itemTotal
//                    .multiply(gstRate)
//                    .divide(
//                            new BigDecimal("100"),
//                            2,
//                            RoundingMode.HALF_UP
//                    );
//
//            BigDecimal commissionRate = new BigDecimal("10.00");
//
//            if (product.getCategoryId() != null) {
//                Category category = categoryRepository
//                        .findById(product.getCategoryId())
//                        .orElse(null);
//
//                if (category != null && category.getCommissionRate() != null) {
//                    commissionRate = category.getCommissionRate();
//                }
//            }
//
//            BigDecimal commissionAmount = itemTotal
//                    .multiply(commissionRate)
//                    .divide(
//                            new BigDecimal("100"),
//                            2,
//                            RoundingMode.HALF_UP
//                    );
//
//            OrderItem orderItem = new OrderItem();
//
//            orderItem.setProductId(product.getId());
//            orderItem.setVendorId(product.getVendorId());
//            orderItem.setQuantity(itemReq.getQuantity());
//            orderItem.setUnitPrice(product.getBasePrice());
//            orderItem.setGstAmount(gstAmount);
//            orderItem.setCommissionAmount(commissionAmount);
//
//            // New order item starts as PENDING
//            orderItem.setItemStatus("PENDING");
//
//            itemsToSave.add(orderItem);
//        }
//
//        Order order = new Order();
//
//        order.setCustomerId(request.getCustomerId());
//        order.setTotalAmount(totalAmount);
//
//        order.setPaymentStatus(
//                "COD".equalsIgnoreCase(request.getPaymentMethod())
//                        ? "PENDING"
//                        : "PAID"
//        );
//
//        order.setOrderStatus("PLACED");
//        order.setDeliveryAddress(request.getDeliveryAddress());
//
//        order.setPaymentMethod(
//                request.getPaymentMethod() != null
//                        ? request.getPaymentMethod()
//                        : "UPI"
//        );
//
//        Order savedOrder = orderRepository.save(order);
//
//        for (OrderItem item : itemsToSave) {
//            item.setOrderId(savedOrder.getId());
//            orderItemRepository.save(item);
//        }
//
//        return savedOrder;
//    }
//
//    public Order getOrderById(Long id) {
//        return orderRepository.findById(id)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Order not found with id: " + id
//                        )
//                );
//    }
//
//    public List<Order> getOrdersByCustomer(Long customerId) {
//        return orderRepository.findByCustomerId(customerId);
//    }
//
//    public List<OrderItem> getOrderItemsByVendor(Long vendorId) {
//        return orderItemRepository.findByVendorId(vendorId);
//    }
//
//    public Order confirmOrder(Long id) {
//        Order order = getOrderById(id);
//
//        order.setOrderStatus("CONFIRMED");
//
//        return orderRepository.save(order);
//    }
//
//    /*
//     * Existing order-level shipping functionality.
//     *
//     * This method is kept unchanged so existing project functionality
//     * is not affected.
//     */
//    public Order shipOrder(Long id) {
//        Order order = getOrderById(id);
//
//        order.setOrderStatus("SHIPPED");
//
//        order.setAwbNumber(
//                "AWB-" +
//                        UUID.randomUUID()
//                                .toString()
//                                .substring(0, 8)
//                                .toUpperCase()
//        );
//
//        return orderRepository.save(order);
//    }
//
//    /*
//     * NEW:
//     * Ship a specific vendor order item.
//     *
//     * This updates ONLY the OrderItem.
//     *
//     * Product information, stock, price, GST and commission
//     * are NOT changed.
//     */
//    public OrderItem shipOrderItem(Long itemId) {
//
//        OrderItem item = orderItemRepository.findById(itemId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Order item not found with id: " + itemId
//                        )
//                );
//
//        // Prevent unnecessary status changes
//        if ("SHIPPED".equalsIgnoreCase(item.getItemStatus())) {
//            return item;
//        }
//
//        if ("DELIVERED".equalsIgnoreCase(item.getItemStatus())) {
//            throw new IllegalStateException(
//                    "Delivered order item cannot be marked as shipped"
//            );
//        }
//
//        if ("RETURNED".equalsIgnoreCase(item.getItemStatus())) {
//            throw new IllegalStateException(
//                    "Returned order item cannot be marked as shipped"
//            );
//        }
//
//        // Update ONLY order item status
//        item.setItemStatus("SHIPPED");
//
//        return orderItemRepository.save(item);
//    }
//
//    public Order deliverOrder(Long id) {
//        Order order = getOrderById(id);
//
//        order.setOrderStatus("DELIVERED");
//        order.setDeliveredAt(LocalDateTime.now());
//
//        List<OrderItem> items = orderItemRepository.findByOrderId(id);
//
//        for (OrderItem item : items) {
//            item.setItemStatus("DELIVERED");
//            orderItemRepository.save(item);
//        }
//
//        return orderRepository.save(order);
//    }
//
//    public Order returnOrder(Long id) {
//        Order order = getOrderById(id);
//
//        order.setOrderStatus("RETURNED");
//
//        List<OrderItem> items = orderItemRepository.findByOrderId(id);
//
//        for (OrderItem item : items) {
//            item.setItemStatus("RETURNED");
//            orderItemRepository.save(item);
//        }
//
//        return orderRepository.save(order);
//    }
//}
//
//
//
