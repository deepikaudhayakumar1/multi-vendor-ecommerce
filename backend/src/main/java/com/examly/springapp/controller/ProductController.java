package com.examly.springapp.controller;

import com.examly.springapp.dto.ProductDTO;
import com.examly.springapp.entity.Product;
import com.examly.springapp.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody ProductDTO dto) {
        Product product = productService.createProduct(dto);
        return ResponseEntity.ok(product);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String status) {
        if ("ACTIVE".equalsIgnoreCase(status)) {
            return ResponseEntity.ok(productService.getAllActiveProducts());
        }
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Product>> getProductsByVendor(@PathVariable Long vendorId) {
        List<Product> products = productService.getProductsByVendor(vendorId);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) {
        Product product = productService.updateProduct(id, dto);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Product> updateProductStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Product product = productService.updateProductStatus(id, status);
        return ResponseEntity.ok(product);
    }
}
