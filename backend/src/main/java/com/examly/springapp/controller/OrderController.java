package com.examly.springapp.controller;

import com.examly.springapp.dto.OrderRequest;
import com.examly.springapp.entity.Order;
import com.examly.springapp.entity.OrderItem;
import com.examly.springapp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<Order> createOrder(
            @RequestBody OrderRequest request
    ) {
        Order order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(
            @PathVariable Long id
    ) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(
            @PathVariable Long customerId
    ) {
        List<Order> orders =
                orderService.getOrdersByCustomer(customerId);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<OrderItem>> getVendorOrderItems(
            @PathVariable Long vendorId
    ) {
        List<OrderItem> items =
                orderService.getOrderItemsByVendor(vendorId);

        return ResponseEntity.ok(items);
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<Order> confirmOrder(
            @PathVariable Long id
    ) {
        Order order = orderService.confirmOrder(id);
        return ResponseEntity.ok(order);
    }

    /*
     * Existing order-level shipping endpoint.
     * Kept unchanged.
     */
    @PutMapping("/{id}/ship")
    public ResponseEntity<Order> shipOrder(
            @PathVariable Long id
    ) {
        Order order = orderService.shipOrder(id);
        return ResponseEntity.ok(order);
    }

    /*
     * NEW:
     * Vendor uses this endpoint when clicking
     * "Mark Shipped" for a specific order item.
     *
     * Example:
     * PUT /api/orders/items/5/ship
     *
     * This changes only order_items.id = 5.
     */
    @PutMapping("/items/{itemId}/ship")
    public ResponseEntity<OrderItem> shipOrderItem(
            @PathVariable Long itemId
    ) {
        OrderItem item = orderService.shipOrderItem(itemId);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}/deliver")
    public ResponseEntity<Order> deliverOrder(
            @PathVariable Long id
    ) {
        Order order = orderService.deliverOrder(id);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Order> returnOrder(
            @PathVariable Long id
    ) {
        Order order = orderService.returnOrder(id);
        return ResponseEntity.ok(order);
    }
}





//package com.examly.springapp.controller;
//
//import com.examly.springapp.dto.OrderRequest;
//import com.examly.springapp.entity.Order;
//import com.examly.springapp.entity.OrderItem;
//import com.examly.springapp.service.OrderService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/orders")
//@CrossOrigin(origins = "*")
//public class OrderController {
//
//    @Autowired
//    private OrderService orderService;
//
//    @PostMapping
//    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
//        Order order = orderService.createOrder(request);
//        return ResponseEntity.ok(order);
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
//        Order order = orderService.getOrderById(id);
//        return ResponseEntity.ok(order);
//    }
//
//    @GetMapping("/customer/{customerId}")
//    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable Long customerId) {
//        List<Order> orders = orderService.getOrdersByCustomer(customerId);
//        return ResponseEntity.ok(orders);
//    }
//
//    @GetMapping("/vendor/{vendorId}")
//    public ResponseEntity<List<OrderItem>> getVendorOrderItems(@PathVariable Long vendorId) {
//        List<OrderItem> items = orderService.getOrderItemsByVendor(vendorId);
//        return ResponseEntity.ok(items);
//    }
//
//    @PutMapping("/{id}/confirm")
//    public ResponseEntity<Order> confirmOrder(@PathVariable Long id) {
//        Order order = orderService.confirmOrder(id);
//        return ResponseEntity.ok(order);
//    }
//
//    @PutMapping("/{id}/ship")
//    public ResponseEntity<Order> shipOrder(@PathVariable Long id) {
//        Order order = orderService.shipOrder(id);
//        return ResponseEntity.ok(order);
//    }
//
//    @PutMapping("/{id}/deliver")
//    public ResponseEntity<Order> deliverOrder(@PathVariable Long id) {
//        Order order = orderService.deliverOrder(id);
//        return ResponseEntity.ok(order);
//    }
//
//    @PostMapping("/{id}/return")
//    public ResponseEntity<Order> returnOrder(@PathVariable Long id) {
//        Order order = orderService.returnOrder(id);
//        return ResponseEntity.ok(order);
//    }
//}
