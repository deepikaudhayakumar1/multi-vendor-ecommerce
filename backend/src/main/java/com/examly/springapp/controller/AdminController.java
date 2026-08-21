package com.examly.springapp.controller;

import com.examly.springapp.entity.Category;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.CategoryRepository;
import com.examly.springapp.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AuthService authService;

    @Autowired
    private CategoryRepository categoryRepository;

    // =====================================================
    // USERS
    // =====================================================

    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(
                authService.getAllUsers()
        );
    }

    @PutMapping("/admin/users/{id}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");

        return ResponseEntity.ok(
                authService.updateUserStatus(id, status)
        );
    }

    // =====================================================
    // GET ALL CATEGORIES
    // GET /api/categories
    // =====================================================

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {

        return ResponseEntity.ok(
                categoryRepository.findAll()
        );
    }

    // =====================================================
    // GET CATEGORY BY ID
    // GET /api/categories/{id}
    // =====================================================

    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getCategoryById(
            @PathVariable Long id) {

        Optional<Category> category =
                categoryRepository.findById(id);

        if (category.isPresent()) {
            return ResponseEntity.ok(
                    category.get()
            );
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Category not found with id: " + id);
    }

    // =====================================================
    // CREATE CATEGORY
    // POST /api/categories
    // =====================================================

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(
            @RequestBody Category category) {

        // Clean category name
        if (category.getName() == null ||
                category.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Category name cannot be empty.");
        }

        String categoryName =
                category.getName().trim();

        // Check duplicate category
        Optional<Category> existingCategory =
                categoryRepository.findByName(categoryName);

        if (existingCategory.isPresent()) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "Category already exists: "
                                    + categoryName
                    );
        }

        category.setName(categoryName);

        Category savedCategory =
                categoryRepository.save(category);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedCategory);
    }

    // =====================================================
    // UPDATE CATEGORY
    // PUT /api/categories/{id}
    // =====================================================

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestBody Category updatedCategory) {

        Optional<Category> existingOptional =
                categoryRepository.findById(id);

        if (existingOptional.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Category not found with id: " + id
                    );
        }

        // Validate name
        if (updatedCategory.getName() == null ||
                updatedCategory.getName().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Category name cannot be empty."
                    );
        }

        String newName =
                updatedCategory.getName().trim();

        // Check duplicate name
        Optional<Category> categoryWithSameName =
                categoryRepository.findByName(newName);

        if (categoryWithSameName.isPresent() &&
                !categoryWithSameName.get()
                        .getId()
                        .equals(id)) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "Another category already exists with name: "
                                    + newName
                    );
        }

        Category existingCategory =
                existingOptional.get();

        // Update fields
        existingCategory.setName(newName);

        existingCategory.setGstRate(
                updatedCategory.getGstRate()
        );

        existingCategory.setCommissionRate(
                updatedCategory.getCommissionRate()
        );

        existingCategory.setReturnWindowDays(
                updatedCategory.getReturnWindowDays()
        );

        Category savedCategory =
                categoryRepository.save(
                        existingCategory
                );

        return ResponseEntity.ok(
                savedCategory
        );
    }

    // =====================================================
    // DELETE CATEGORY
    // DELETE /api/categories/{id}
    // =====================================================

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(
            @PathVariable Long id) {

        Optional<Category> category =
                categoryRepository.findById(id);

        if (category.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Category not found with id: " + id
                    );
        }

        try {

            categoryRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Category deleted successfully: "
                            + category.get().getName()
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            "Cannot delete this category because "
                                    + "it may already be used by a product."
                    );
        }
    }
}