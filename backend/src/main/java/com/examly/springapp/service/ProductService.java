
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

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public Product createProduct(ProductDTO dto) {
        if (dto.getBasePrice() == null || dto.getMrp() == null || dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0 || dto.getBasePrice().compareTo(dto.getMrp()) > 0) {
            throw new IllegalArgumentException("Selling price must be a positive number not exceeding MRP");
        }

        if (dto.getStock() == null || dto.getStock() < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }

        List<Product> existing = productRepository.findByVendorId(dto.getVendorId());
        boolean isDuplicate = existing.stream().anyMatch(p -> p.getName().equalsIgnoreCase(dto.getName().trim()));
        if (isDuplicate) {
            throw new DuplicateProductException("Product with name '" + dto.getName() + "' already exists for this vendor");
        }

        Product product = new Product();
        product.setVendorId(dto.getVendorId());
        product.setName(dto.getName().trim());
        product.setCategoryId(dto.getCategoryId());
        product.setDescription(dto.getDescription());
        product.setBasePrice(dto.getBasePrice());
        product.setMrp(dto.getMrp());
        product.setStock(dto.getStock());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId()).orElse(null);
            if (category != null) {
                product.setGstRate(category.getGstRate());
            } else {
                product.setGstRate(dto.getGstRate() != null ? dto.getGstRate() : new BigDecimal("18.00"));
            }
        } else {
            product.setGstRate(dto.getGstRate() != null ? dto.getGstRate() : new BigDecimal("18.00"));
        }

        product.setStatus("PENDING_REVIEW"); // Category manager must review
        product.setImageUrl(dto.getImageUrl() != null ? dto.getImageUrl() : "https://picsum.photos/400/300?random=" + System.currentTimeMillis());

        return productRepository.save(product);
    }

    public List<Product> getAllActiveProducts() {
        return productRepository.findByStatus("ACTIVE");
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> getProductsByVendor(Long vendorId) {
        return productRepository.findByVendorId(vendorId);
    }

    public Product updateProductStatus(Long id, String status) {
        Product product = getProductById(id);
        product.setStatus(status);
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductDTO dto) {
        Product product = getProductById(id);

        if (dto.getBasePrice() != null && dto.getMrp() != null) {
            if (dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0 || dto.getBasePrice().compareTo(dto.getMrp()) > 0) {
                throw new IllegalArgumentException("Selling price must be a positive number not exceeding MRP");
            }
            product.setBasePrice(dto.getBasePrice());
            product.setMrp(dto.getMrp());
        }

        if (dto.getStock() != null) {
            if (dto.getStock() < 0) {
                throw new IllegalArgumentException("Stock quantity cannot be negative");
            }
            product.setStock(dto.getStock());
        }

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());

        return productRepository.save(product);
    }
}










//package com.examly.springapp.service;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.util.StringUtils;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.nio.file.*;
//import java.util.UUID;
//
//@Service
//public class FileStorageService {
//
//    private final Path uploadPath;
//
//
//    public FileStorageService(
//            @Value("${file.upload-dir:uploads}") String uploadDir
//    ) throws IOException {
//
//        this.uploadPath = Paths.get(uploadDir)
//                .toAbsolutePath()
//                .normalize();
//
//        Files.createDirectories(this.uploadPath);
//    }
//
//
//    public String storeFile(MultipartFile file) throws IOException {
//
//        if (file == null || file.isEmpty()) {
//            throw new IllegalArgumentException("Uploaded file is empty");
//        }
//
//
//        String contentType = file.getContentType();
//
//        if (contentType == null || !contentType.startsWith("image/")) {
//            throw new IllegalArgumentException(
//                    "Only image files are allowed"
//            );
//        }
//
//
//        String originalFilename =
//                StringUtils.cleanPath(
//                        file.getOriginalFilename()
//                );
//
//
//        String extension = "";
//
//        int dotIndex = originalFilename.lastIndexOf(".");
//
//        if (dotIndex >= 0) {
//            extension = originalFilename.substring(dotIndex);
//        }
//
//
//        String filename =
//                UUID.randomUUID().toString() + extension;
//
//
//        Path targetLocation =
//                uploadPath.resolve(filename);
//
//
//        Files.copy(
//                file.getInputStream(),
//                targetLocation,
//                StandardCopyOption.REPLACE_EXISTING
//        );
//
//
//        return "/uploads/" + filename;
//    }
//}
//
//
////package com.examly.springapp.service;
////
////import com.examly.springapp.dto.ProductDTO;
////import com.examly.springapp.entity.Category;
////import com.examly.springapp.entity.Product;
////import com.examly.springapp.exception.DuplicateProductException;
////import com.examly.springapp.exception.ResourceNotFoundException;
////import com.examly.springapp.repository.CategoryRepository;
////import com.examly.springapp.repository.ProductRepository;
////
////import org.springframework.beans.factory.annotation.Autowired;
////import org.springframework.stereotype.Service;
////
////import java.math.BigDecimal;
////import java.util.List;
////
////@Service
////public class ProductService {
////
////    @Autowired
////    private ProductRepository productRepository;
////
////    @Autowired
////    private CategoryRepository categoryRepository;
////
////
////    // ============================
////    // CREATE PRODUCT
////    // ============================
////
////    public Product createProduct(ProductDTO dto) {
////
////        if (dto.getName() == null ||
////                dto.getName().trim().isEmpty()) {
////
////            throw new IllegalArgumentException(
////                    "Product name is required"
////            );
////        }
////
////        if (dto.getBasePrice() == null ||
////                dto.getMrp() == null ||
////                dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0 ||
////                dto.getBasePrice().compareTo(dto.getMrp()) > 0) {
////
////            throw new IllegalArgumentException(
////                    "Selling price must be a positive number not exceeding MRP"
////            );
////        }
////
////        if (dto.getStock() == null ||
////                dto.getStock() < 0) {
////
////            throw new IllegalArgumentException(
////                    "Stock quantity cannot be negative"
////            );
////        }
////
////
////        // ============================
////        // DUPLICATE PRODUCT CHECK
////        // ============================
////
////        List<Product> existing =
////                productRepository.findByVendorId(dto.getVendorId());
////
////        boolean duplicate = existing.stream()
////                .anyMatch(product ->
////                        product.getName()
////                                .equalsIgnoreCase(
////                                        dto.getName().trim()
////                                )
////                );
////
////        if (duplicate) {
////
////            throw new DuplicateProductException(
////                    "Product with name '" +
////                            dto.getName() +
////                            "' already exists for this vendor"
////            );
////        }
////
////
////        // ============================
////        // CREATE PRODUCT
////        // ============================
////
////        Product product = new Product();
////
////        product.setVendorId(dto.getVendorId());
////
////        product.setName(
////                dto.getName().trim()
////        );
////
////        product.setCategoryId(
////                dto.getCategoryId()
////        );
////
////        product.setDescription(
////                dto.getDescription()
////        );
////
////        product.setBasePrice(
////                dto.getBasePrice()
////        );
////
////        product.setMrp(
////                dto.getMrp()
////        );
////
////        product.setStock(
////                dto.getStock()
////        );
////
////
////        // ============================
////        // GST
////        // ============================
////
////        if (dto.getCategoryId() != null) {
////
////            Category category =
////                    categoryRepository
////                            .findById(dto.getCategoryId())
////                            .orElse(null);
////
////            if (category != null &&
////                    category.getGstRate() != null) {
////
////                product.setGstRate(
////                        category.getGstRate()
////                );
////
////            } else {
////
////                product.setGstRate(
////                        dto.getGstRate() != null
////                                ? dto.getGstRate()
////                                : new BigDecimal("18.00")
////                );
////            }
////
////        } else {
////
////            product.setGstRate(
////                    dto.getGstRate() != null
////                            ? dto.getGstRate()
////                            : new BigDecimal("18.00")
////            );
////        }
////
////
////        // ============================
////        // STATUS
////        // ============================
////
////        product.setStatus("PENDING_REVIEW");
////
////
////        // ============================
////        // IMAGE
////        // ============================
////
////        if (dto.getImageUrl() != null &&
////                !dto.getImageUrl().trim().isEmpty()) {
////
////            product.setImageUrl(
////                    dto.getImageUrl()
////            );
////
////        } else {
////
////            product.setImageUrl(
////                    "https://picsum.photos/400/300?random="
////                            + System.currentTimeMillis()
////            );
////        }
////
////
////        return productRepository.save(product);
////    }
////
////
////    // ============================
////    // GET ACTIVE PRODUCTS
////    // ============================
////
////    public List<Product> getAllActiveProducts() {
////
////        return productRepository.findByStatus("ACTIVE");
////    }
////
////
////    // ============================
////    // GET ALL PRODUCTS
////    // ============================
////
////    public List<Product> getAllProducts() {
////
////        return productRepository.findAll();
////    }
////
////
////    // ============================
////    // GET PRODUCT BY ID
////    // ============================
////
////    public Product getProductById(Long id) {
////
////        return productRepository.findById(id)
////                .orElseThrow(() ->
////                        new ResourceNotFoundException(
////                                "Product not found with id: " + id
////                        )
////                );
////    }
////
////
////    // ============================
////    // GET PRODUCTS BY VENDOR
////    // ============================
////
////    public List<Product> getProductsByVendor(
////            Long vendorId) {
////
////        return productRepository.findByVendorId(vendorId);
////    }
////
////
////    // ============================
////    // UPDATE PRODUCT
////    // ============================
////
////    public Product updateProduct(
////            Long id,
////            ProductDTO dto) {
////
////        Product product =
////                getProductById(id);
////
////
////        if (dto.getBasePrice() != null &&
////                dto.getMrp() != null) {
////
////            if (dto.getBasePrice()
////                    .compareTo(BigDecimal.ZERO) <= 0 ||
////                    dto.getBasePrice()
////                            .compareTo(dto.getMrp()) > 0) {
////
////                throw new IllegalArgumentException(
////                        "Selling price must be a positive number not exceeding MRP"
////                );
////            }
////
////            product.setBasePrice(
////                    dto.getBasePrice()
////            );
////
////            product.setMrp(
////                    dto.getMrp()
////            );
////        }
////
////
////        if (dto.getStock() != null) {
////
////            if (dto.getStock() < 0) {
////
////                throw new IllegalArgumentException(
////                        "Stock quantity cannot be negative"
////                );
////            }
////
////            product.setStock(
////                    dto.getStock()
////            );
////        }
////
////
////        if (dto.getName() != null &&
////                !dto.getName().trim().isEmpty()) {
////
////            product.setName(
////                    dto.getName().trim()
////            );
////        }
////
////
////        if (dto.getDescription() != null) {
////
////            product.setDescription(
////                    dto.getDescription()
////            );
////        }
////
////
////        if (dto.getCategoryId() != null) {
////
////            product.setCategoryId(
////                    dto.getCategoryId()
////            );
////
////            Category category =
////                    categoryRepository
////                            .findById(dto.getCategoryId())
////                            .orElse(null);
////
////            if (category != null &&
////                    category.getGstRate() != null) {
////
////                product.setGstRate(
////                        category.getGstRate()
////                );
////            }
////        }
////
////
////        if (dto.getImageUrl() != null) {
////
////            product.setImageUrl(
////                    dto.getImageUrl()
////            );
////        }
////
////
////        return productRepository.save(product);
////    }
////
////
////    // ============================
////    // UPDATE STATUS
////    // ============================
////
////    public Product updateProductStatus(
////            Long id,
////            String status) {
////
////        Product product =
////                getProductById(id);
////
////        if (status == null ||
////                status.trim().isEmpty()) {
////
////            throw new IllegalArgumentException(
////                    "Product status is required"
////            );
////        }
////
////        product.setStatus(
////                status.toUpperCase()
////        );
////
////        return productRepository.save(product);
////    }
////}
////
//////package com.examly.springapp.service;
//////
//////import com.examly.springapp.dto.ProductDTO;
//////import com.examly.springapp.entity.Category;
//////import com.examly.springapp.entity.Product;
//////import com.examly.springapp.exception.DuplicateProductException;
//////import com.examly.springapp.exception.ResourceNotFoundException;
//////import com.examly.springapp.repository.CategoryRepository;
//////import com.examly.springapp.repository.ProductRepository;
//////import org.springframework.beans.factory.annotation.Autowired;
//////import org.springframework.stereotype.Service;
//////
//////import java.math.BigDecimal;
//////import java.util.List;
//////
//////@Service
//////public class ProductService {
//////
//////    @Autowired
//////    private ProductRepository productRepository;
//////
//////    @Autowired
//////    private CategoryRepository categoryRepository;
//////
//////    public Product createProduct(ProductDTO dto) {
//////
//////        if (dto.getBasePrice() == null ||
//////                dto.getMrp() == null ||
//////                dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0 ||
//////                dto.getBasePrice().compareTo(dto.getMrp()) > 0) {
//////
//////            throw new IllegalArgumentException(
//////                    "Selling price must be a positive number not exceeding MRP"
//////            );
//////        }
//////
//////        if (dto.getStock() == null || dto.getStock() < 0) {
//////            throw new IllegalArgumentException(
//////                    "Stock quantity cannot be negative"
//////            );
//////        }
//////
//////        List<Product> existing =
//////                productRepository.findByVendorId(dto.getVendorId());
//////
//////        boolean isDuplicate = existing.stream()
//////                .anyMatch(p ->
//////                        p.getName().equalsIgnoreCase(dto.getName().trim())
//////                );
//////
//////        if (isDuplicate) {
//////            throw new DuplicateProductException(
//////                    "Product with name '" +
//////                            dto.getName() +
//////                            "' already exists for this vendor"
//////            );
//////        }
//////
//////        Product product = new Product();
//////
//////        product.setVendorId(dto.getVendorId());
//////        product.setName(dto.getName().trim());
//////        product.setCategoryId(dto.getCategoryId());
//////        product.setDescription(dto.getDescription());
//////        product.setBasePrice(dto.getBasePrice());
//////        product.setMrp(dto.getMrp());
//////        product.setStock(dto.getStock());
//////
//////        if (dto.getCategoryId() != null) {
//////
//////            Category category =
//////                    categoryRepository.findById(dto.getCategoryId())
//////                            .orElse(null);
//////
//////            if (category != null) {
//////                product.setGstRate(category.getGstRate());
//////            } else {
//////                product.setGstRate(
//////                        dto.getGstRate() != null
//////                                ? dto.getGstRate()
//////                                : new BigDecimal("18.00")
//////                );
//////            }
//////
//////        } else {
//////
//////            product.setGstRate(
//////                    dto.getGstRate() != null
//////                            ? dto.getGstRate()
//////                            : new BigDecimal("18.00")
//////            );
//////        }
//////
//////        product.setStatus("PENDING_REVIEW");
//////
//////        product.setImageUrl(
//////                dto.getImageUrl() != null
//////                        ? dto.getImageUrl()
//////                        : "https://picsum.photos/400/300?random="
//////                          + System.currentTimeMillis()
//////        );
//////
//////        return productRepository.save(product);
//////    }
//////
//////    public List<Product> getAllActiveProducts() {
//////        return productRepository.findByStatus("ACTIVE");
//////    }
//////
//////    public List<Product> getAllProducts() {
//////        return productRepository.findAll();
//////    }
//////
//////    public Product getProductById(Long id) {
//////        return productRepository.findById(id)
//////                .orElseThrow(() ->
//////                        new ResourceNotFoundException(
//////                                "Product not found with id: " + id
//////                        )
//////                );
//////    }
//////
//////    public List<Product> getProductsByVendor(Long vendorId) {
//////        return productRepository.findByVendorId(vendorId);
//////    }
//////
//////    public Product updateProductStatus(Long id, String status) {
//////
//////        Product product = getProductById(id);
//////
//////        product.setStatus(status);
//////
//////        return productRepository.save(product);
//////    }
//////
//////    public Product updateProduct(Long id, ProductDTO dto) {
//////
//////        Product product = getProductById(id);
//////
//////        if (dto.getBasePrice() != null &&
//////                dto.getMrp() != null) {
//////
//////            if (dto.getBasePrice().compareTo(BigDecimal.ZERO) <= 0 ||
//////                    dto.getBasePrice().compareTo(dto.getMrp()) > 0) {
//////
//////                throw new IllegalArgumentException(
//////                        "Selling price must be a positive number not exceeding MRP"
//////                );
//////            }
//////
//////            product.setBasePrice(dto.getBasePrice());
//////            product.setMrp(dto.getMrp());
//////        }
//////
//////        if (dto.getStock() != null) {
//////
//////            if (dto.getStock() < 0) {
//////                throw new IllegalArgumentException(
//////                        "Stock quantity cannot be negative"
//////                );
//////            }
//////
//////            product.setStock(dto.getStock());
//////        }
//////
//////        if (dto.getName() != null) {
//////            product.setName(dto.getName());
//////        }
//////
//////        if (dto.getDescription() != null) {
//////            product.setDescription(dto.getDescription());
//////        }
//////
//////        if (dto.getImageUrl() != null) {
//////            product.setImageUrl(dto.getImageUrl());
//////        }
//////
//////        return productRepository.save(product);
//////    }
//////}
//////
//////
//////
//////
//////
//////
//////
//////
//////
//////
//package com.examly.springapp.service;
//
//import com.examly.springapp.dto.ProductCreateRequest;
//import com.examly.springapp.entity.Product;
//import com.examly.springapp.repository.ProductRepository;
//
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.math.BigDecimal;
//import java.util.ArrayList;
//import java.util.List;
//
//@Service
//public class ProductService {
//
//    private final ProductRepository productRepository;
//
//    private final FileStorageService fileStorageService;
//
//
//    public ProductService(
//            ProductRepository productRepository,
//            FileStorageService fileStorageService
//    ) {
//        this.productRepository = productRepository;
//        this.fileStorageService = fileStorageService;
//    }
//
//
//    public Product createProduct(
//            ProductCreateRequest request,
//            MultipartFile[] images,
//            Long vendorId
//    ) throws IOException {
//
//
//        // -----------------------------
//        // Validation
//        // -----------------------------
//
//        if (request.getName() == null ||
//                request.getName().trim().isEmpty()) {
//
//            throw new IllegalArgumentException(
//                    "Product name is required"
//            );
//        }
//
//
//        if (request.getMrp() == null ||
//                request.getMrp().compareTo(BigDecimal.ZERO) <= 0) {
//
//            throw new IllegalArgumentException(
//                    "MRP must be greater than zero"
//            );
//        }
//
//
//        if (request.getSellingPrice() == null ||
//                request.getSellingPrice()
//                        .compareTo(BigDecimal.ZERO) <= 0) {
//
//            throw new IllegalArgumentException(
//                    "Selling price must be greater than zero"
//            );
//        }
//
//
//        if (request.getSellingPrice()
//                .compareTo(request.getMrp()) > 0) {
//
//            throw new IllegalArgumentException(
//                    "Selling price cannot exceed MRP"
//            );
//        }
//
//
//        if (request.getStock() == null ||
//                request.getStock() < 0) {
//
//            throw new IllegalArgumentException(
//                    "Stock cannot be negative"
//            );
//        }
//
//
//        // SRS requirement:
//        // minimum 4 product images
//
//        if (images == null || images.length < 4) {
//
//            throw new IllegalArgumentException(
//                    "Minimum 4 product images are required"
//            );
//        }
//
//
//        // -----------------------------
//        // Create Product
//        // -----------------------------
//
//        Product product = new Product();
//
//        product.setVendorId(vendorId);
//
//        product.setName(request.getName());
//
//        product.setCategory(request.getCategory());
//
//        product.setDescription(request.getDescription());
//
//        product.setMrp(request.getMrp());
//
//        product.setSellingPrice(
//                request.getSellingPrice()
//        );
//
//        product.setStock(request.getStock());
//
//        product.setGstRate(
//                request.getGstRate()
//        );
//
//        product.setStatus("PENDING_REVIEW");
//
//
//        // -----------------------------
//        // Save Images
//        // -----------------------------
//
//        List<String> imageUrls = new ArrayList<>();
//
//
//        for (MultipartFile image : images) {
//
//            if (image == null || image.isEmpty()) {
//                continue;
//            }
//
//
//            String imageUrl =
//                    fileStorageService.storeFile(image);
//
//
//            imageUrls.add(imageUrl);
//        }
//
//
//        if (imageUrls.size() < 4) {
//
//            throw new IllegalArgumentException(
//                    "At least 4 valid images are required"
//            );
//        }
//
//
//        product.setImageUrls(imageUrls);
//
//
//        // -----------------------------
//        // Save Product
//        // -----------------------------
//
//        return productRepository.save(product);
//    }
//}




