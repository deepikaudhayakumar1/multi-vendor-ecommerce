package com.examly.springapp.service;

import com.examly.springapp.dto.ReviewResponse;
import com.examly.springapp.entity.Order;
import com.examly.springapp.entity.OrderItem;
import com.examly.springapp.entity.Review;
import com.examly.springapp.entity.User;
import com.examly.springapp.repository.OrderItemRepository;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.ReviewRepository;
import com.examly.springapp.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final FileStorageService fileStorageService;

    public ReviewService(
            ReviewRepository reviewRepository,
            UserRepository userRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            FileStorageService fileStorageService
    ) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.fileStorageService = fileStorageService;
    }

    // ============================================================
    // GET REVIEWS
    // ============================================================

    public List<ReviewResponse> getProductReviews(Long productId) {

        List<Review> reviews =
                reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);

        List<ReviewResponse> response = new ArrayList<>();

        for (Review review : reviews) {
            response.add(toResponse(review));
        }

        return response;
    }

    // ============================================================
    // CREATE REVIEW
    // ============================================================

    public ReviewResponse createReview(
            Long productId,
            Integer rating,
            String title,
            String reviewText,
            String email,
            MultipartFile[] images
    ) {

        if (productId == null) {
            throw new RuntimeException("Product ID is required");
        }

        if (rating == null || rating < 1 || rating > 5) {
            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        if (reviewText == null || reviewText.trim().isEmpty()) {
            throw new RuntimeException(
                    "Review text is required"
            );
        }

        // --------------------------------------------------------
        // Find logged-in customer
        // --------------------------------------------------------

        User customer = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        if (!"CUSTOMER".equalsIgnoreCase(customer.getRole())) {
            throw new RuntimeException(
                    "Only customers can submit product reviews"
            );
        }

        Long customerId = customer.getId();

        // --------------------------------------------------------
        // Prevent duplicate review
        // --------------------------------------------------------

        if (reviewRepository.existsByProductIdAndCustomerId(
                productId,
                customerId
        )) {

            throw new RuntimeException(
                    "You have already reviewed this product"
            );
        }

        // --------------------------------------------------------
        // Verify actual purchase
        // --------------------------------------------------------

        boolean purchased = hasCustomerPurchasedProduct(
                customerId,
                productId
        );

        if (!purchased) {
            throw new RuntimeException(
                    "You can review this product only after purchasing it"
            );
        }

        // --------------------------------------------------------
        // Create Review
        // --------------------------------------------------------

        Review review = new Review();

        review.setProductId(productId);
        review.setCustomerId(customerId);
        review.setRating(rating);
        review.setTitle(
                title == null ? null : title.trim()
        );
        review.setReviewText(reviewText.trim());

        // This review is verified because purchase was confirmed
        review.setVerifiedPurchase(true);

        // --------------------------------------------------------
        // Upload review images
        // --------------------------------------------------------

        List<String> imageUrls = new ArrayList<>();

        if (images != null && images.length > 0) {

            if (images.length > 5) {
                throw new RuntimeException(
                        "You can upload maximum 5 review images"
                );
            }

            for (MultipartFile image : images) {

                if (image == null || image.isEmpty()) {
                    continue;
                }

                String contentType = image.getContentType();

                if (
                        contentType == null ||
                                !contentType.startsWith("image/")
                ) {
                    throw new RuntimeException(
                            "Only image files are allowed"
                    );
                }

                if (image.getSize() > 5 * 1024 * 1024) {
                    throw new RuntimeException(
                            "Each review image must be less than 5MB"
                    );
                }

                String imageUrl =
                        fileStorageService.storeFile(image);

                imageUrls.add(imageUrl);
            }
        }

        review.setImageUrls(imageUrls);

        Review savedReview =
                reviewRepository.save(review);

        return toResponse(savedReview);
    }

    // ============================================================
    // CHECK CUSTOMER PURCHASE
    // ============================================================

    private boolean hasCustomerPurchasedProduct(
            Long customerId,
            Long productId
    ) {

        List<Order> orders =
                orderRepository.findByCustomerId(customerId);

        for (Order order : orders) {

            if (order == null) {
                continue;
            }

            // Review allowed only for delivered orders
            if (
                    !"DELIVERED".equalsIgnoreCase(
                            order.getOrderStatus()
                    )
            ) {
                continue;
            }

            List<OrderItem> items =
                    orderItemRepository.findByOrderId(
                            order.getId()
                    );

            for (OrderItem item : items) {

                if (
                        productId.equals(item.getProductId())
                ) {

                    if (
                            !"RETURNED".equalsIgnoreCase(
                                    item.getItemStatus()
                            )
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // ============================================================
    // MAP ENTITY → DTO
    // ============================================================

    private ReviewResponse toResponse(
            Review review
    ) {

        ReviewResponse response =
                new ReviewResponse();

        response.setId(review.getId());
        response.setProductId(review.getProductId());
        response.setCustomerId(review.getCustomerId());

        User customer =
                userRepository.findById(
                        review.getCustomerId()
                ).orElse(null);

        if (customer != null) {
            response.setCustomerName(
                    customer.getName()
            );
        } else {
            response.setCustomerName(
                    "Verified Customer"
            );
        }

        response.setRating(review.getRating());
        response.setTitle(review.getTitle());
        response.setReviewText(review.getReviewText());

        response.setVerifiedPurchase(
                review.getVerifiedPurchase()
        );

        response.setVendorReply(
                review.getVendorReply()
        );

        response.setImageUrls(
                review.getImageUrls()
        );

        response.setCreatedAt(
                review.getCreatedAt()
        );

        return response;
    }
}





//package com.examly.springapp.service;
//
//public class ReviewService {
//}
