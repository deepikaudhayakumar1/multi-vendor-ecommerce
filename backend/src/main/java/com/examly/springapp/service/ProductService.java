package com.examly.springapp.service;

import com.examly.springapp.dto.ProductDTO;
import com.examly.springapp.entity.Category;
import com.examly.springapp.entity.Product;
import com.examly.springapp.exception.DuplicateProductException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.repository.ProductRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;


    // ============================================================
    // OLD JSON CREATE METHOD
    // Keeps existing /api/products working
    // ============================================================

    public Product createProduct(ProductDTO dto) {

        return createProduct(dto, new MultipartFile[0]);
    }


    // ============================================================
    // CREATE PRODUCT + MULTIPLE IMAGES
    // ============================================================

    public Product createProduct(
            ProductDTO dto,
            MultipartFile[] images) {

        // --------------------------------------------------------
        // Validate name
        // --------------------------------------------------------

        if (dto.getName() == null ||
                dto.getName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Product name is required"
            );
        }


        // --------------------------------------------------------
        // Validate price
        // --------------------------------------------------------

        if (dto.getBasePrice() == null ||
                dto.getMrp() == null ||
                dto.getBasePrice()
                        .compareTo(BigDecimal.ZERO) <= 0 ||
                dto.getBasePrice()
                        .compareTo(dto.getMrp()) > 0) {

            throw new IllegalArgumentException(
                    "Selling price must be a positive number not exceeding MRP"
            );
        }


        // --------------------------------------------------------
        // Validate stock
        // --------------------------------------------------------

        if (dto.getStock() == null ||
                dto.getStock() < 0) {

            throw new IllegalArgumentException(
                    "Stock quantity cannot be negative"
            );
        }


        // --------------------------------------------------------
        // Validate vendor
        // --------------------------------------------------------

        if (dto.getVendorId() == null) {

            throw new IllegalArgumentException(
                    "Vendor ID is required"
            );
        }


        // --------------------------------------------------------
        // Validate images
        // --------------------------------------------------------

        if (images != null && images.length > 0) {

            if (images.length < 4) {

                throw new IllegalArgumentException(
                        "Please upload at least 4 product images"
                );
            }

            if (images.length > 8) {

                throw new IllegalArgumentException(
                        "You can upload a maximum of 8 images"
                );
            }


            for (MultipartFile image : images) {

                if (image == null || image.isEmpty()) {

                    throw new IllegalArgumentException(
                            "One of the uploaded images is empty"
                    );
                }


                if (image.getContentType() == null ||
                        !image.getContentType().startsWith("image/")) {

                    throw new IllegalArgumentException(
                            "Only image files are allowed"
                    );
                }


                // 10 MB maximum
                if (image.getSize() >
                        10 * 1024 * 1024) {

                    throw new IllegalArgumentException(
                            "Each image must be less than 10MB"
                    );
                }
            }
        }


        // --------------------------------------------------------
        // Duplicate product check
        // --------------------------------------------------------

        List<Product> existing =
                productRepository.findByVendorId(
                        dto.getVendorId()
                );

        boolean isDuplicate =
                existing.stream()
                        .anyMatch(p ->
                                p.getName() != null &&
                                        p.getName()
                                                .equalsIgnoreCase(
                                                        dto.getName().trim()
                                                )
                        );


        if (isDuplicate) {

            throw new DuplicateProductException(
                    "Product with name '" +
                            dto.getName() +
                            "' already exists for this vendor"
            );
        }


        // --------------------------------------------------------
        // Create Product
        // --------------------------------------------------------

        Product product = new Product();

        product.setVendorId(dto.getVendorId());

        product.setName(
                dto.getName().trim()
        );

        product.setCategoryId(
                dto.getCategoryId()
        );

        product.setDescription(
                dto.getDescription()
        );

        product.setBasePrice(
                dto.getBasePrice()
        );

        product.setMrp(
                dto.getMrp()
        );

        product.setStock(
                dto.getStock()
        );


        // --------------------------------------------------------
        // GST
        // --------------------------------------------------------

        if (dto.getCategoryId() != null) {

            Category category =
                    categoryRepository
                            .findById(dto.getCategoryId())
                            .orElse(null);

            if (category != null) {

                product.setGstRate(
                        category.getGstRate()
                );

            } else {

                product.setGstRate(
                        dto.getGstRate() != null
                                ? dto.getGstRate()
                                : new BigDecimal("18.00")
                );
            }

        } else {

            product.setGstRate(
                    dto.getGstRate() != null
                            ? dto.getGstRate()
                            : new BigDecimal("18.00")
            );
        }


        // --------------------------------------------------------
        // Review status
        // --------------------------------------------------------

        product.setStatus(
                "PENDING_REVIEW"
        );


        // --------------------------------------------------------
        // Save images
        // --------------------------------------------------------

        List<String> savedImageUrls =
                new ArrayList<>();


        if (images != null) {

            for (MultipartFile image : images) {

                if (image != null &&
                        !image.isEmpty()) {

                    String imageUrl =
                            saveImage(image);

                    savedImageUrls.add(
                            imageUrl
                    );
                }
            }
        }


        // --------------------------------------------------------
        // Set image URLs
        // --------------------------------------------------------

        if (!savedImageUrls.isEmpty()) {

            // First image = primary image
            product.setImageUrl(
                    savedImageUrls.get(0)
            );

            // All images
            product.setImageUrls(
                    savedImageUrls
            );
        }


        // --------------------------------------------------------
        // Save product
        // --------------------------------------------------------

        return productRepository.save(product);
    }


    // ============================================================
    // SAVE IMAGE
    // ============================================================

    private String saveImage(
            MultipartFile image) {

        try {

            Path uploadPath =
                    Paths.get(
                            "uploads/products"
                    );


            if (!Files.exists(uploadPath)) {

                Files.createDirectories(
                        uploadPath
                );
            }


            String originalFilename =
                    image.getOriginalFilename();

            String extension = "";


            if (originalFilename != null &&
                    originalFilename.contains(".")) {

                extension =
                        originalFilename.substring(
                                originalFilename
                                        .lastIndexOf(".")
                        );
            }


            String fileName =
                    UUID.randomUUID()
                            + extension;


            Path filePath =
                    uploadPath.resolve(
                            fileName
                    );


            Files.copy(
                    image.getInputStream(),
                    filePath,
                    StandardCopyOption.REPLACE_EXISTING
            );


            return "/uploads/products/" +
                    fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save product image",
                    e
            );
        }
    }


    // ============================================================
    // GET ALL ACTIVE
    // ============================================================

    public List<Product> getAllActiveProducts() {

        return productRepository
                .findByStatus("ACTIVE");
    }


    // ============================================================
    // GET ALL
    // ============================================================

    public List<Product> getAllProducts() {

        return productRepository.findAll();
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with id: " +
                                        id
                        )
                );
    }


    // ============================================================
    // GET BY VENDOR
    // ============================================================

    public List<Product> getProductsByVendor(
            Long vendorId) {

        return productRepository
                .findByVendorId(vendorId);
    }


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    public Product updateProductStatus(
            Long id,
            String status) {

        Product product =
                getProductById(id);

        product.setStatus(status);

        return productRepository.save(product);
    }


    // ============================================================
    // UPDATE PRODUCT
    // ============================================================

    public Product updateProduct(
            Long id,
            ProductDTO dto) {

        Product product =
                getProductById(id);


        // --------------------------------------------------------
        // Vendor ownership check
        // --------------------------------------------------------

        if (dto.getVendorId() != null &&
                !product.getVendorId()
                        .equals(dto.getVendorId())) {

            throw new IllegalArgumentException(
                    "You are not allowed to update this product"
            );
        }


        // --------------------------------------------------------
        // Update price
        // --------------------------------------------------------

        if (dto.getBasePrice() != null &&
                dto.getMrp() != null) {

            if (dto.getBasePrice()
                    .compareTo(BigDecimal.ZERO) <= 0 ||
                    dto.getBasePrice()
                            .compareTo(dto.getMrp()) > 0) {

                throw new IllegalArgumentException(
                        "Selling price must be a positive number not exceeding MRP"
                );
            }

            product.setBasePrice(
                    dto.getBasePrice()
            );

            product.setMrp(
                    dto.getMrp()
            );
        }


        // --------------------------------------------------------
        // Update stock
        // --------------------------------------------------------

        if (dto.getStock() != null) {

            if (dto.getStock() < 0) {

                throw new IllegalArgumentException(
                        "Stock quantity cannot be negative"
                );
            }

            product.setStock(
                    dto.getStock()
            );
        }


        // --------------------------------------------------------
        // Update name
        // --------------------------------------------------------

        if (dto.getName() != null &&
                !dto.getName().trim().isEmpty()) {

            product.setName(
                    dto.getName().trim()
            );
        }


        // --------------------------------------------------------
        // Update description
        // --------------------------------------------------------

        if (dto.getDescription() != null) {

            product.setDescription(
                    dto.getDescription()
            );
        }


        // --------------------------------------------------------
        // Update category
        // --------------------------------------------------------

        if (dto.getCategoryId() != null) {

            product.setCategoryId(
                    dto.getCategoryId()
            );

            Category category =
                    categoryRepository
                            .findById(dto.getCategoryId())
                            .orElse(null);

            if (category != null) {

                product.setGstRate(
                        category.getGstRate()
                );
            }
        }


        // --------------------------------------------------------
        // Keep existing image support
        // --------------------------------------------------------

        if (dto.getImageUrl() != null) {

            product.setImageUrl(
                    dto.getImageUrl()
            );
        }


        return productRepository.save(product);
    }


    // ============================================================
    // DELETE PRODUCT
    // ============================================================

    public void deleteProduct(
            Long id,
            Long vendorId) {

        Product product =
                getProductById(id);


        // --------------------------------------------------------
        // Vendor ownership check
        // --------------------------------------------------------

        if (!product.getVendorId()
                .equals(vendorId)) {

            throw new IllegalArgumentException(
                    "You are not allowed to delete this product"
            );
        }


        // --------------------------------------------------------
        // Delete product
        // --------------------------------------------------------

        productRepository.delete(product);
    }
}













//package com.examly.springapp.service;
//
//import com.examly.springapp.dto.ProductDTO;
//import com.examly.springapp.entity.Category;
//import com.examly.springapp.entity.Product;
//import com.examly.springapp.exception.DuplicateProductException;
//import com.examly.springapp.exception.ResourceNotFoundException;
//import com.examly.springapp.repository.CategoryRepository;
//import com.examly.springapp.repository.ProductRepository;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.nio.file.Files;
//import java.nio.file.Path;
//import java.nio.file.Paths;
//import java.nio.file.StandardCopyOption;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class ProductService {
//
//    @Autowired
//    private ProductRepository productRepository;
//
//    @Autowired
//    private CategoryRepository categoryRepository;
//
//
//    // ============================================================
//    // OLD JSON CREATE METHOD
//    // Keeps existing /api/products working
//    // ============================================================
//
//    public Product createProduct(ProductDTO dto) {
//
//        return createProduct(dto, new MultipartFile[0]);
//    }
//
//
//    // ============================================================
//    // CREATE PRODUCT + MULTIPLE IMAGES
//    // ============================================================
//
//    public Product createProduct(
//            ProductDTO dto,
//            MultipartFile[] images) {
//
//        // --------------------------------------------------------
//        // Validate name
//        // --------------------------------------------------------
//
//        if (dto.getName() == null ||
//                dto.getName().trim().isEmpty()) {
//
//            throw new IllegalArgumentException(
//                    "Product name is required"
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Validate price
//        // --------------------------------------------------------
//
//        if (dto.getBasePrice() == null ||
//                dto.getMrp() == null ||
//                dto.getBasePrice()
//                        .compareTo(BigDecimal.ZERO) <= 0 ||
//                dto.getBasePrice()
//                        .compareTo(dto.getMrp()) > 0) {
//
//            throw new IllegalArgumentException(
//                    "Selling price must be a positive number not exceeding MRP"
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Validate stock
//        // --------------------------------------------------------
//
//        if (dto.getStock() == null ||
//                dto.getStock() < 0) {
//
//            throw new IllegalArgumentException(
//                    "Stock quantity cannot be negative"
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Validate vendor
//        // --------------------------------------------------------
//
//        if (dto.getVendorId() == null) {
//
//            throw new IllegalArgumentException(
//                    "Vendor ID is required"
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Validate images
//        // --------------------------------------------------------
//
//        if (images != null && images.length > 0) {
//
//            if (images.length < 4) {
//
//                throw new IllegalArgumentException(
//                        "Please upload at least 4 product images"
//                );
//            }
//
//            if (images.length > 8) {
//
//                throw new IllegalArgumentException(
//                        "You can upload a maximum of 8 images"
//                );
//            }
//
//
//            for (MultipartFile image : images) {
//
//                if (image == null || image.isEmpty()) {
//
//                    throw new IllegalArgumentException(
//                            "One of the uploaded images is empty"
//                    );
//                }
//
//
//                if (!image.getContentType()
//                        .startsWith("image/")) {
//
//                    throw new IllegalArgumentException(
//                            "Only image files are allowed"
//                    );
//                }
//
//
//                // 10 MB maximum
//                if (image.getSize() >
//                        10 * 1024 * 1024) {
//
//                    throw new IllegalArgumentException(
//                            "Each image must be less than 10MB"
//                    );
//                }
//            }
//        }
//
//
//        // --------------------------------------------------------
//        // Duplicate product check
//        // --------------------------------------------------------
//
//        List<Product> existing =
//                productRepository.findByVendorId(
//                        dto.getVendorId()
//                );
//
//        boolean isDuplicate =
//                existing.stream()
//                        .anyMatch(p ->
//                                p.getName() != null &&
//                                        p.getName()
//                                                .equalsIgnoreCase(
//                                                        dto.getName().trim()
//                                                )
//                        );
//
//
//        if (isDuplicate) {
//
//            throw new DuplicateProductException(
//                    "Product with name '" +
//                            dto.getName() +
//                            "' already exists for this vendor"
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Create Product
//        // --------------------------------------------------------
//
//        Product product = new Product();
//
//        product.setVendorId(dto.getVendorId());
//
//        product.setName(
//                dto.getName().trim()
//        );
//
//        product.setCategoryId(
//                dto.getCategoryId()
//        );
//
//        product.setDescription(
//                dto.getDescription()
//        );
//
//        product.setBasePrice(
//                dto.getBasePrice()
//        );
//
//        product.setMrp(
//                dto.getMrp()
//        );
//
//        product.setStock(
//                dto.getStock()
//        );
//
//
//        // --------------------------------------------------------
//        // GST
//        // --------------------------------------------------------
//
//        if (dto.getCategoryId() != null) {
//
//            Category category =
//                    categoryRepository
//                            .findById(dto.getCategoryId())
//                            .orElse(null);
//
//            if (category != null) {
//
//                product.setGstRate(
//                        category.getGstRate()
//                );
//
//            } else {
//
//                product.setGstRate(
//                        dto.getGstRate() != null
//                                ? dto.getGstRate()
//                                : new BigDecimal("18.00")
//                );
//            }
//
//        } else {
//
//            product.setGstRate(
//                    dto.getGstRate() != null
//                            ? dto.getGstRate()
//                            : new BigDecimal("18.00")
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Review status
//        // --------------------------------------------------------
//
//        product.setStatus(
//                "PENDING_REVIEW"
//        );
//
//
//        // --------------------------------------------------------
//        // Save images
//        // --------------------------------------------------------
//
//        List<String> savedImageUrls =
//                new ArrayList<>();
//
//
//        if (images != null) {
//
//            for (MultipartFile image : images) {
//
//                if (image != null &&
//                        !image.isEmpty()) {
//
//                    String imageUrl =
//                            saveImage(image);
//
//                    savedImageUrls.add(
//                            imageUrl
//                    );
//                }
//            }
//        }
//
//
//        // --------------------------------------------------------
//        // Set image URLs
//        // --------------------------------------------------------
//
//        if (!savedImageUrls.isEmpty()) {
//
//            // First image = primary image
//            product.setImageUrl(
//                    savedImageUrls.get(0)
//            );
//
//            // All images
//            product.setImageUrls(
//                    savedImageUrls
//            );
//        }
//
//
//        // --------------------------------------------------------
//        // Save product
//        // --------------------------------------------------------
//
//        return productRepository.save(product);
//    }
//
//
//    // ============================================================
//    // SAVE IMAGE
//    // ============================================================
//
//    private String saveImage(
//            MultipartFile image) {
//
//        try {
//
//            Path uploadPath =
//                    Paths.get(
//                            "uploads/products"
//                    );
//
//
//            if (!Files.exists(uploadPath)) {
//
//                Files.createDirectories(
//                        uploadPath
//                );
//            }
//
//
//            String originalFilename =
//                    image.getOriginalFilename();
//
//
//            String extension = "";
//
//
//            if (originalFilename != null &&
//                    originalFilename.contains(".")) {
//
//                extension =
//                        originalFilename.substring(
//                                originalFilename
//                                        .lastIndexOf(".")
//                        );
//            }
//
//
//            String fileName =
//                    UUID.randomUUID()
//                            + extension;
//
//
//            Path filePath =
//                    uploadPath.resolve(
//                            fileName
//                    );
//
//
//            Files.copy(
//                    image.getInputStream(),
//                    filePath,
//                    StandardCopyOption.REPLACE_EXISTING
//            );
//
//
//            return "/uploads/products/" +
//                    fileName;
//
//        } catch (IOException e) {
//
//            throw new RuntimeException(
//                    "Failed to save product image",
//                    e
//            );
//        }
//    }
//
//
//    // ============================================================
//    // GET ALL ACTIVE
//    // ============================================================
//
//    public List<Product> getAllActiveProducts() {
//
//        return productRepository
//                .findByStatus("ACTIVE");
//    }
//
//
//    // ============================================================
//    // GET ALL
//    // ============================================================
//
//    public List<Product> getAllProducts() {
//
//        return productRepository.findAll();
//    }
//
//
//    // ============================================================
//    // GET BY ID
//    // ============================================================
//
//    public Product getProductById(Long id) {
//
//        return productRepository.findById(id)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException(
//                                "Product not found with id: " +
//                                        id
//                        )
//                );
//    }
//
//
//    // ============================================================
//    // GET BY VENDOR
//    // ============================================================
//
//    public List<Product> getProductsByVendor(
//            Long vendorId) {
//
//        return productRepository
//                .findByVendorId(vendorId);
//    }
//
//
//    // ============================================================
//    // UPDATE STATUS
//    // ============================================================
//
//    public Product updateProductStatus(
//            Long id,
//            String status) {
//
//        Product product =
//                getProductById(id);
//
//        product.setStatus(status);
//
//        return productRepository.save(product);
//    }
//
//
//    // ============================================================
//    // UPDATE PRODUCT
//    // ============================================================
//
//    public Product updateProduct(
//            Long id,
//            ProductDTO dto) {
//
//        Product product =
//                getProductById(id);
//
//
//        if (dto.getBasePrice() != null &&
//                dto.getMrp() != null) {
//
//            if (dto.getBasePrice()
//                    .compareTo(BigDecimal.ZERO) <= 0 ||
//                    dto.getBasePrice()
//                            .compareTo(dto.getMrp()) > 0) {
//
//                throw new IllegalArgumentException(
//                        "Selling price must be a positive number not exceeding MRP"
//                );
//            }
//
//            product.setBasePrice(
//                    dto.getBasePrice()
//            );
//
//            product.setMrp(
//                    dto.getMrp()
//            );
//        }
//
//
//        if (dto.getStock() != null) {
//
//            if (dto.getStock() < 0) {
//
//                throw new IllegalArgumentException(
//                        "Stock quantity cannot be negative"
//                );
//            }
//
//            product.setStock(
//                    dto.getStock()
//            );
//        }
//
//
//        if (dto.getName() != null &&
//                !dto.getName().trim().isEmpty()) {
//
//            product.setName(
//                    dto.getName().trim()
//            );
//        }
//
//
//        if (dto.getDescription() != null) {
//
//            product.setDescription(
//                    dto.getDescription()
//            );
//        }
//
//
//        if (dto.getImageUrl() != null) {
//
//            product.setImageUrl(
//                    dto.getImageUrl()
//            );
//        }
//
//
//        return productRepository.save(product);
//    }
//}
