package com.examly.springapp.repository;

import com.examly.springapp.entity.VendorPayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorPayoutRepository extends JpaRepository<VendorPayout, Long> {
    List<VendorPayout> findByVendorId(Long vendorId);
}
