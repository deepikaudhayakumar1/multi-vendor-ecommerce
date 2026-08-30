package com.examly.springapp.service;

import com.examly.springapp.entity.Order;
import com.examly.springapp.entity.OrderItem;
import com.examly.springapp.entity.VendorPayout;
import com.examly.springapp.repository.OrderItemRepository;
import com.examly.springapp.repository.OrderRepository;
import com.examly.springapp.repository.VendorPayoutRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayoutService {

    @Autowired
    private VendorPayoutRepository vendorPayoutRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<VendorPayout> getPayoutsByVendor(Long vendorId) {
        return vendorPayoutRepository.findByVendorId(vendorId);
    }

    /**
     * Process weekly payout for one vendor.
     *
     * Includes only:
     * 1. Orders inside the current 7-day period
     * 2. Successfully paid orders
     * 3. Non-cancelled orders
     * 4. Non-returned orders
     * 5. Non-returned order items
     *
     * Prevents duplicate payout for the same vendor + period.
     *
     * If there are no eligible sales, no payout is created.
     */
    @Transactional
    public VendorPayout processVendorPayout(Long vendorId) {

        if (vendorId == null) {
            throw new IllegalArgumentException("Vendor ID is required");
        }

        LocalDate periodEnd = LocalDate.now();
        LocalDate periodStart = periodEnd.minusDays(7);

        // ----------------------------------------------------
        // PREVENT DUPLICATE PAYOUT FOR SAME PERIOD
        // ----------------------------------------------------

        List<VendorPayout> existingPayouts =
                vendorPayoutRepository.findByVendorId(vendorId);

        boolean alreadyProcessed = existingPayouts.stream()
                .anyMatch(p ->
                        periodStart.equals(p.getPeriodStart())
                                && periodEnd.equals(p.getPeriodEnd())
                );

        if (alreadyProcessed) {
            throw new IllegalStateException(
                    "Weekly payout has already been processed for this vendor and period"
            );
        }

        // ----------------------------------------------------
        // GET VENDOR ORDER ITEMS
        // ----------------------------------------------------

        List<OrderItem> vendorItems =
                orderItemRepository.findByVendorId(vendorId);

        BigDecimal grossSales = BigDecimal.ZERO;
        BigDecimal commissionDeducted = BigDecimal.ZERO;

        for (OrderItem item : vendorItems) {

            if (item.getOrderId() == null) {
                continue;
            }

            Order order = orderRepository.findById(item.getOrderId())
                    .orElse(null);

            if (order == null) {
                continue;
            }

            // ------------------------------------------------
            // PERIOD CHECK
            // ------------------------------------------------

            if (order.getPlacedAt() == null) {
                continue;
            }

            LocalDate orderDate =
                    order.getPlacedAt().toLocalDate();

            if (orderDate.isBefore(periodStart)
                    || orderDate.isAfter(periodEnd)) {
                continue;
            }

            // ------------------------------------------------
            // PAYMENT CHECK
            // ------------------------------------------------

            if (!"PAID".equalsIgnoreCase(order.getPaymentStatus())) {
                continue;
            }

            // ------------------------------------------------
            // ORDER STATUS CHECK
            // ------------------------------------------------

            if ("CANCELLED".equalsIgnoreCase(order.getOrderStatus())
                    || "RETURNED".equalsIgnoreCase(order.getOrderStatus())) {
                continue;
            }

            // ------------------------------------------------
            // ITEM STATUS CHECK
            // ------------------------------------------------

            if ("RETURNED".equalsIgnoreCase(item.getItemStatus())) {
                continue;
            }

            // ------------------------------------------------
            // CALCULATE ITEM SALES
            // ------------------------------------------------

            if (item.getUnitPrice() == null
                    || item.getQuantity() == null) {
                continue;
            }

            if (item.getQuantity() <= 0) {
                continue;
            }

            BigDecimal itemSales =
                    item.getUnitPrice()
                            .multiply(
                                    BigDecimal.valueOf(item.getQuantity())
                            );

            if (itemSales.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            grossSales = grossSales.add(itemSales);

            // ------------------------------------------------
            // COMMISSION
            // ------------------------------------------------

            if (item.getCommissionAmount() != null
                    && item.getCommissionAmount()
                    .compareTo(BigDecimal.ZERO) > 0) {

                commissionDeducted =
                        commissionDeducted.add(
                                item.getCommissionAmount()
                        );
            }
        }

        // ----------------------------------------------------
        // IMPORTANT:
        // DO NOT CREATE ZERO-VALUE PAYOUT
        // ----------------------------------------------------

        if (grossSales.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException(
                    "No eligible sales found for this vendor in the current payout period"
            );
        }

        // ----------------------------------------------------
        // SECTION 194O - 1% TDS
        // ----------------------------------------------------

        BigDecimal tdsDeducted =
                grossSales
                        .multiply(new BigDecimal("1.00"))
                        .divide(
                                new BigDecimal("100"),
                                2,
                                RoundingMode.HALF_UP
                        );

        // ----------------------------------------------------
        // NET PAYOUT
        // ----------------------------------------------------

        BigDecimal netPayout =
                grossSales
                        .subtract(commissionDeducted)
                        .subtract(tdsDeducted);

        if (netPayout.compareTo(BigDecimal.ZERO) < 0) {
            netPayout = BigDecimal.ZERO;
        }

        // ----------------------------------------------------
        // CREATE PAYOUT
        // ----------------------------------------------------

        VendorPayout payout = new VendorPayout();

        payout.setVendorId(vendorId);

        payout.setPeriodStart(periodStart);
        payout.setPeriodEnd(periodEnd);

        payout.setGrossSales(
                grossSales.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        payout.setCommissionDeducted(
                commissionDeducted.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        payout.setTdsDeducted(
                tdsDeducted.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        payout.setNetPayout(
                netPayout.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        /*
         * Current project is a demo/simulation environment.
         * Therefore payout execution is represented as PAID
         * and a demo UTR is generated.
         *
         * For production, replace this section with the
         * actual bank/payment settlement API.
         */
        payout.setPayoutStatus("PAID");

        payout.setUtrNumber(
                "UTR"
                        + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase()
        );

        return vendorPayoutRepository.save(payout);
    }

    /**
     * Process weekly payout for every vendor that has
     * order items in the system.
     *
     * Vendors without eligible sales are skipped.
     * Vendors whose payout is already processed are also skipped.
     */
    @Transactional
    public List<VendorPayout> processAllVendorPayouts() {

        List<OrderItem> allItems =
                orderItemRepository.findAll();

        Set<Long> vendorIds =
                allItems.stream()
                        .map(OrderItem::getVendorId)
                        .filter(id -> id != null)
                        .collect(
                                Collectors.toCollection(
                                        LinkedHashSet::new
                                )
                        );

        List<VendorPayout> processedPayouts =
                new ArrayList<>();

        for (Long vendorId : vendorIds) {

            try {

                VendorPayout payout =
                        processVendorPayout(vendorId);

                if (payout != null) {
                    processedPayouts.add(payout);
                }

            } catch (IllegalStateException ignored) {

                /*
                 * Two cases are intentionally skipped:
                 *
                 * 1. Payout already processed for this period
                 * 2. Vendor has no eligible sales
                 *
                 * Processing continues for other vendors.
                 */
            }
        }

        return processedPayouts;
    }

    public List<VendorPayout> getAllPayouts() {
        return vendorPayoutRepository.findAll();
    }
}

//pa
//
//
// ckage com.examly.springapp.service;
//
//import com.examly.springapp.entity.OrderItem;
//import com.examly.springapp.entity.VendorPayout;
//import com.examly.springapp.repository.OrderItemRepository;
//import com.examly.springapp.repository.VendorPayoutRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.math.BigDecimal;
//import java.math.RoundingMode;
//import java.time.LocalDate;
//import java.util.List;
//import java.util.UUID;
//
//@Service
//public class PayoutService {
//
//    @Autowired
//    private VendorPayoutRepository vendorPayoutRepository;
//
//    @Autowired
//    private OrderItemRepository orderItemRepository;
//
//    public List<VendorPayout> getPayoutsByVendor(Long vendorId) {
//        return vendorPayoutRepository.findByVendorId(vendorId);
//    }
//
//    public VendorPayout processVendorPayout(Long vendorId) {
//        List<OrderItem> vendorItems = orderItemRepository.findByVendorId(vendorId);
//
//        BigDecimal grossSales = BigDecimal.ZERO;
//        BigDecimal commissionDeducted = BigDecimal.ZERO;
//
//        for (OrderItem item : vendorItems) {
//            BigDecimal itemSales = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
//            grossSales = grossSales.add(itemSales);
//            commissionDeducted = commissionDeducted.add(item.getCommissionAmount() != null ? item.getCommissionAmount() : BigDecimal.ZERO);
//        }
//
//        // Section 194O: 1% TDS on Gross Sales
//        BigDecimal tdsDeducted = grossSales.multiply(new BigDecimal("1.00")).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
//        BigDecimal netPayout = grossSales.subtract(commissionDeducted).subtract(tdsDeducted);
//
//        if (netPayout.compareTo(BigDecimal.ZERO) < 0) {
//            netPayout = BigDecimal.ZERO;
//        }
//
//        VendorPayout payout = new VendorPayout();
//        payout.setVendorId(vendorId);
//        payout.setPeriodStart(LocalDate.now().minusDays(7));
//        payout.setPeriodEnd(LocalDate.now());
//        payout.setGrossSales(grossSales);
//        payout.setCommissionDeducted(commissionDeducted);
//        payout.setTdsDeducted(tdsDeducted);
//        payout.setNetPayout(netPayout);
//        payout.setPayoutStatus("PAID");
//        payout.setUtrNumber("UTR" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 12).toUpperCase());
//
//        return vendorPayoutRepository.save(payout);
//    }
//
//    public List<VendorPayout> getAllPayouts() {
//        return vendorPayoutRepository.findAll();
//    }
//}
