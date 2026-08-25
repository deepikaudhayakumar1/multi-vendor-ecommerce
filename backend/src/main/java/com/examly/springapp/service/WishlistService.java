package com.examly.springapp.service;

import com.examly.springapp.dto.WishlistResponseDTO;
import com.examly.springapp.entity.Product;
import com.examly.springapp.entity.User;
import com.examly.springapp.entity.Wishlist;
import com.examly.springapp.repository.ProductRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.repository.WishlistRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public WishlistService(
            WishlistRepository wishlistRepository,
            UserRepository userRepository,
            ProductRepository productRepository
    ) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // =========================================================
    // GET USER WISHLIST
    // =========================================================

    @Transactional(readOnly = true)
    public List<WishlistResponseDTO> getWishlist(Long userId) {

        return wishlistRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ADD PRODUCT TO WISHLIST
    // =========================================================

    @Transactional
    public WishlistResponseDTO addToWishlist(
            Long userId,
            Long productId
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        Product product = productRepository.findById(productId)
                .orElseThrow(() ->
                        new RuntimeException("Product not found")
                );

        Wishlist existing =
                wishlistRepository
                        .findByUserIdAndProductId(
                                userId,
                                productId
                        )
                        .orElse(null);

        if (existing != null) {
            return convertToDTO(existing);
        }

        Wishlist wishlist =
                new Wishlist(user, product);

        Wishlist saved =
                wishlistRepository.save(wishlist);

        return convertToDTO(saved);
    }

    // =========================================================
    // REMOVE PRODUCT FROM WISHLIST
    // =========================================================

    @Transactional
    public void removeFromWishlist(
            Long userId,
            Long productId
    ) {

        if (!wishlistRepository.existsByUserIdAndProductId(
                userId,
                productId
        )) {
            return;
        }

        wishlistRepository.deleteByUserIdAndProductId(
                userId,
                productId
        );
    }

    // =========================================================
    // CHECK PRODUCT
    // =========================================================

    @Transactional(readOnly = true)
    public boolean isInWishlist(
            Long userId,
            Long productId
    ) {

        return wishlistRepository.existsByUserIdAndProductId(
                userId,
                productId
        );
    }

    // =========================================================
    // CONVERT ENTITY → DTO
    // =========================================================

    private WishlistResponseDTO convertToDTO(Wishlist wishlist) {

        Product product = wishlist.getProduct();

        return new WishlistResponseDTO(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getBasePrice(),
                product.getMrp(),
                product.getStock(),
                product.getStatus(),
                product.getImageUrl()
        );
    }
}