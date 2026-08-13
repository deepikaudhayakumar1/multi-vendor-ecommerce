package com.examly.springapp.service;

import com.examly.springapp.entity.OrderItem;
import com.examly.springapp.entity.VendorPayout;
import com.examly.springapp.repository.OrderItemRepository;
import com.examly.springapp.repository.VendorPayoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PayoutService {

    @Autowired
    private VendorPayoutRepository vendorPayoutRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    public List<VendorPayout> getPayoutsByVendor(Long vendorId) {
        return vendorPayoutRepository.findByVendorId(vendorId);
    }

    public VendorPayout processVendorPayout(Long vendorId) {
        List<OrderItem> vendorItems = orderItemRepository.findByVendorId(vendorId);

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal commissionDeducted = BigDecimal.ZERO;

        for (OrderItem item : vendorItems) {
            BigDecimal itemSales = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            grossSales = grossSales.add(itemSales);
            commissionDeducted = commissionDeducted.add(item.getCommissionAmount() != null ? item.getCommissionAmount() : BigDecimal.ZERO);
        }

        // Section 194O: 1% TDS on Gross Sales
        BigDecimal tdsDeducted = grossSales.multiply(new BigDecimal("1.00")).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal netPayout = grossSales.subtract(commissionDeducted).subtract(tdsDeducted);

        if (netPayout.compareTo(BigDecimal.ZERO) < 0) {
            netPayout = BigDecimal.ZERO;
        }

        VendorPayout payout = new VendorPayout();
        payout.setVendorId(vendorId);
        payout.setPeriodStart(LocalDate.now().minusDays(7));
        payout.setPeriodEnd(LocalDate.now());
        payout.setGrossSales(grossSales);
        payout.setCommissionDeducted(commissionDeducted);
        payout.setTdsDeducted(tdsDeducted);
        payout.setNetPayout(netPayout);
        payout.setPayoutStatus("PAID");
        payout.setUtrNumber("UTR" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12).toUpperCase());

        return vendorPayoutRepository.save(payout);
    }

    public List<VendorPayout> getAllPayouts() {
        return vendorPayoutRepository.findAll();
    }
}
