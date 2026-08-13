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

    public Order createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> itemsToSave = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (itemReq.getQuantity() > product.getStock()) {
                throw new IllegalArgumentException("Quantity must not exceed available stock");
            }

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getBasePrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);

            BigDecimal gstRate = product.getGstRate() != null ? product.getGstRate() : new BigDecimal("18.00");
            BigDecimal gstAmount = itemTotal.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            BigDecimal commissionRate = new BigDecimal("10.00");
            if (product.getCategoryId() != null) {
                Category category = categoryRepository.findById(product.getCategoryId()).orElse(null);
                if (category != null && category.getCommissionRate() != null) {
                    commissionRate = category.getCommissionRate();
                }
            }
            BigDecimal commissionAmount = itemTotal.multiply(commissionRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(product.getId());
            orderItem.setVendorId(product.getVendorId());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getBasePrice());
            orderItem.setGstAmount(gstAmount);
            orderItem.setCommissionAmount(commissionAmount);
            orderItem.setItemStatus("PENDING");

            itemsToSave.add(orderItem);
        }

        Order order = new Order();
        order.setCustomerId(request.getCustomerId());
        order.setTotalAmount(totalAmount);
        order.setPaymentStatus("COD".equalsIgnoreCase(request.getPaymentMethod()) ? "PENDING" : "PAID");
        order.setOrderStatus("PLACED");
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI");

        Order savedOrder = orderRepository.save(order);

        for (OrderItem item : itemsToSave) {
            item.setOrderId(savedOrder.getId());
            orderItemRepository.save(item);
        }

        return savedOrder;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    public List<Order> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    public List<OrderItem> getOrderItemsByVendor(Long vendorId) {
        return orderItemRepository.findByVendorId(vendorId);
    }

    public Order confirmOrder(Long id) {
        Order order = getOrderById(id);
        order.setOrderStatus("CONFIRMED");
        return orderRepository.save(order);
    }

    public Order shipOrder(Long id) {
        Order order = getOrderById(id);
        order.setOrderStatus("SHIPPED");
        order.setAwbNumber("AWB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return orderRepository.save(order);
    }

    public Order deliverOrder(Long id) {
        Order order = getOrderById(id);
        order.setOrderStatus("DELIVERED");
        order.setDeliveredAt(LocalDateTime.now());

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        for (OrderItem item : items) {
            item.setItemStatus("DELIVERED");
            orderItemRepository.save(item);
        }
        return orderRepository.save(order);
    }

    public Order returnOrder(Long id) {
        Order order = getOrderById(id);
        order.setOrderStatus("RETURNED");

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        for (OrderItem item : items) {
            item.setItemStatus("RETURNED");
            orderItemRepository.save(item);
        }
        return orderRepository.save(order);
    }
}
