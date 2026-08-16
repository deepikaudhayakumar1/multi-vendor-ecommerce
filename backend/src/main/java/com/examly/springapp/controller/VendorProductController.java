package com.examly.springapp.controller;

import com.examly.springapp.dto.ProductDTO;
import com.examly.springapp.entity.Product;
import com.examly.springapp.service.ProductService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/products")
@CrossOrigin(origins = "*")
public class VendorProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper;


    // ============================================================
    // CREATE PRODUCT + 4 TO 8 IMAGES
    // ============================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Product> createProduct(

            @RequestPart("product")
            String productJson,

            @RequestPart("images")
            MultipartFile[] images) {

        try {

            // Convert JSON string -> ProductDTO
            ProductDTO productDTO =
                    objectMapper.readValue(
                            productJson,
                            ProductDTO.class
                    );


            // Validate image count
            if (images == null || images.length < 4) {

                throw new IllegalArgumentException(
                        "Please upload at least 4 product images"
                );
            }


            if (images.length > 8) {

                throw new IllegalArgumentException(
                        "Maximum 8 product images are allowed"
                );
            }


            // Create product
            Product product =
                    productService.createProduct(
                            productDTO,
                            images
                    );


            return ResponseEntity.ok(product);

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Invalid product JSON: " + e.getMessage(),
                    e
            );
        }
    }


    // ============================================================
    // GET VENDOR PRODUCTS
    // ============================================================

    @GetMapping("/{vendorId}")
    public ResponseEntity<List<Product>> getVendorProducts(
            @PathVariable Long vendorId) {

        return ResponseEntity.ok(
                productService.getProductsByVendor(vendorId)
        );
    }
}
