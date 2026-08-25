package com.examly.springapp.controller;

import com.examly.springapp.dto.ReviewResponse;
import com.examly.springapp.service.ReviewService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // ============================================================
    // GET ALL REVIEWS FOR A PRODUCT
    // ============================================================

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getProductReviews(
            @PathVariable Long productId
    ) {

        List<ReviewResponse> reviews =
                reviewService.getProductReviews(productId);

        return ResponseEntity.ok(reviews);
    }

    // ============================================================
    // CREATE REVIEW
    //
    // POST:
    // /api/reviews/product/{productId}
    //
    // Content-Type:
    // multipart/form-data
    // ============================================================

    @PostMapping(
            value = "/product/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> createReview(
            @PathVariable Long productId,

            @RequestParam("rating")
            Integer rating,

            @RequestParam(value = "title", required = false)
            String title,

            @RequestParam("reviewText")
            String reviewText,

            @RequestPart(
                    value = "images",
                    required = false
            )
            MultipartFile[] images,

            Authentication authentication
    ) {

        // ========================================================
        // CHECK LOGIN
        // ========================================================

        if (authentication == null) {

            return ResponseEntity
                    .status(401)
                    .body("Please login to write a review");
        }

        // ========================================================
        // VALIDATE PRODUCT ID
        // ========================================================

        if (productId == null) {

            return ResponseEntity
                    .badRequest()
                    .body("Product ID is required");
        }

        // ========================================================
        // VALIDATE RATING
        // ========================================================

        if (rating == null || rating < 1 || rating > 5) {

            return ResponseEntity
                    .badRequest()
                    .body("Rating must be between 1 and 5");
        }

        // ========================================================
        // VALIDATE REVIEW TEXT
        // ========================================================

        if (reviewText == null ||
                reviewText.trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body("Review text is required");
        }

        try {

            // ====================================================
            // GET LOGGED-IN USER
            // ====================================================

            String username =
                    authentication.getName();

            // ====================================================
            // CREATE REVIEW
            // ====================================================

            ReviewResponse response =
                    reviewService.createReview(
                            productId,
                            rating,
                            title,
                            reviewText,
                            username,
                            images
                    );

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to create review: "
                                    + e.getMessage()
                    );
        }
    }
}


//package com.examly.springapp.controller;
//
//public class ReviewController {
//}
