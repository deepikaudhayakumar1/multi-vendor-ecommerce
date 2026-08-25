package com.examly.springapp.repository;

import com.examly.springapp.entity.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    Optional<Review> findByProductIdAndCustomerId(
            Long productId,
            Long customerId
    );

    boolean existsByProductIdAndCustomerId(
            Long productId,
            Long customerId
    );
}





//package com.examly.springapp.repository;
//
//import com.examly.springapp.entity.Review;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//import java.util.List;
//
//@Repository
//public interface ReviewRepository extends JpaRepository<Review, Long> {
//    List<Review> findByProductId(Long productId);
//}
