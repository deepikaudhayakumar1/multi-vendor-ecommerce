//package com.examly.springapp.repository;
//
//import com.examly.springapp.entity.Product;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//
//public interface ProductRepository
//        extends JpaRepository<Product, Long> {
//
//    List<Product> findByVendorId(Long vendorId);
//
//    List<Product> findByStatus(String status);
//}
//package com.examly.springapp.repository;
//
//import com.examly.springapp.entity.Product;
//import org.springframework.data.jpa.repository.JpaRepository;
//
//import java.util.List;
//
//public interface ProductRepository
//        extends JpaRepository<Product, Long> {
//
//    List<Product> findByVendorId(Long vendorId);
//
//}



package com.examly.springapp.repository;

import com.examly.springapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByVendorId(Long vendorId);
    List<Product> findByStatus(String status);
    List<Product> findByCategoryIdAndStatus(Long categoryId, String status);
}
