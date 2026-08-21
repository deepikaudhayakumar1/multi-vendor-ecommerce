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


    // ============================================================
    // CREATE PRODUCT
    // ============================================================

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody ProductDTO dto) {

        Product product =
                productService.createProduct(dto);

        return ResponseEntity.ok(product);
    }


    // ============================================================
    // GET ALL PRODUCTS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(
            @RequestParam(required = false)
            String status) {

        if ("ACTIVE".equalsIgnoreCase(status)) {

            return ResponseEntity.ok(
                    productService
                            .getAllActiveProducts()
            );
        }

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }


    // ============================================================
    // GET PRODUCT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService
                        .getProductById(id)
        );
    }


    // ============================================================
    // GET PRODUCTS BY VENDOR
    // ============================================================

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Product>>
    getProductsByVendor(
            @PathVariable Long vendorId) {

        return ResponseEntity.ok(
                productService
                        .getProductsByVendor(vendorId)
        );
    }


    // ============================================================
    // UPDATE PRODUCT
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDTO dto) {

        return ResponseEntity.ok(
                productService
                        .updateProduct(id, dto)
        );
    }


    // ============================================================
    // UPDATE PRODUCT STATUS
    // ============================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<Product>
    updateProductStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status =
                body.get("status");

        return ResponseEntity.ok(
                productService
                        .updateProductStatus(
                                id,
                                status
                        )
        );
    }


    // ============================================================
    // DELETE PRODUCT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id,
            @RequestParam Long vendorId) {

        productService.deleteProduct(
                id,
                vendorId
        );

        return ResponseEntity.ok(
                "Product deleted successfully"
        );
    }
}





//package com.examly.springapp.controller;
//
//import com.examly.springapp.dto.ProductDTO;
//import com.examly.springapp.entity.Product;
//import com.examly.springapp.service.ProductService;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/products")
//@CrossOrigin(origins = "*")
//public class ProductController {
//
//    @Autowired
//    private ProductService productService;
//
//
//    @PostMapping
//    public ResponseEntity<Product> createProduct(
//            @RequestBody ProductDTO dto) {
//
//        Product product =
//                productService.createProduct(dto);
//
//        return ResponseEntity.ok(product);
//    }
//
//
//    @GetMapping
//    public ResponseEntity<List<Product>> getAllProducts(
//            @RequestParam(required = false)
//            String status) {
//
//        if ("ACTIVE".equalsIgnoreCase(status)) {
//
//            return ResponseEntity.ok(
//                    productService
//                            .getAllActiveProducts()
//            );
//        }
//
//        return ResponseEntity.ok(
//                productService.getAllProducts()
//        );
//    }
//
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Product> getProductById(
//            @PathVariable Long id) {
//
//        return ResponseEntity.ok(
//                productService
//                        .getProductById(id)
//        );
//    }
//
//
//    @GetMapping("/vendor/{vendorId}")
//    public ResponseEntity<List<Product>>
//    getProductsByVendor(
//            @PathVariable Long vendorId) {
//
//        return ResponseEntity.ok(
//                productService
//                        .getProductsByVendor(vendorId)
//        );
//    }
//
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Product> updateProduct(
//            @PathVariable Long id,
//            @RequestBody ProductDTO dto) {
//
//        return ResponseEntity.ok(
//                productService
//                        .updateProduct(id, dto)
//        );
//    }
//
//
//    @PutMapping("/{id}/status")
//    public ResponseEntity<Product>
//    updateProductStatus(
//            @PathVariable Long id,
//            @RequestBody Map<String, String> body) {
//
//        String status =
//                body.get("status");
//
//        return ResponseEntity.ok(
//                productService
//                        .updateProductStatus(
//                                id,
//                                status
//                        )
//        );
//    }
//}
