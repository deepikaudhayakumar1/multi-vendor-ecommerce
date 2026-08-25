package com.examly.springapp.controller;

import com.examly.springapp.dto.WishlistResponseDTO;
import com.examly.springapp.service.WishlistService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(
            WishlistService wishlistService
    ) {
        this.wishlistService = wishlistService;
    }

    // =========================================================
    // GET WISHLIST
    // GET /api/wishlist/{userId}
    // =========================================================

    @GetMapping("/{userId}")
    public ResponseEntity<List<WishlistResponseDTO>> getWishlist(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                wishlistService.getWishlist(userId)
        );
    }

    // =========================================================
    // ADD TO WISHLIST
    // POST /api/wishlist/{userId}/{productId}
    // =========================================================

    @PostMapping("/{userId}/{productId}")
    public ResponseEntity<WishlistResponseDTO> addToWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                wishlistService.addToWishlist(
                        userId,
                        productId
                )
        );
    }

    // =========================================================
    // REMOVE FROM WISHLIST
    // DELETE /api/wishlist/{userId}/{productId}
    // =========================================================

    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {

        wishlistService.removeFromWishlist(
                userId,
                productId
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CHECK WISHLIST
    // GET /api/wishlist/{userId}/check/{productId}
    // =========================================================

    @GetMapping("/{userId}/check/{productId}")
    public ResponseEntity<Boolean> checkWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {

        return ResponseEntity.ok(
                wishlistService.isInWishlist(
                        userId,
                        productId
                )
        );
    }
}