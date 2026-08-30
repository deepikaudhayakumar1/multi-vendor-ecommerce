package com.examly.springapp.controller;

import com.examly.springapp.entity.VendorPayout;
import com.examly.springapp.service.PayoutService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PayoutController {

    @Autowired
    private PayoutService payoutService;

    // --------------------------------------------------------
    // GET PAYOUTS FOR ONE VENDOR
    // --------------------------------------------------------

    @GetMapping("/payouts/vendor/{vendorId}")
    public ResponseEntity<List<VendorPayout>> getVendorPayouts(
            @PathVariable Long vendorId) {

        return ResponseEntity.ok(
                payoutService.getPayoutsByVendor(vendorId)
        );
    }

    // --------------------------------------------------------
    // PROCESS ONE VENDOR PAYOUT
    // --------------------------------------------------------

    @PostMapping("/payouts/process")
    public ResponseEntity<?> processPayout(
            @RequestBody Map<String, Long> body) {

        Long vendorId = body.get("vendorId");

        if (vendorId == null) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            "Vendor ID is required"
                    )
            );
        }

        try {

            VendorPayout payout =
                    payoutService.processVendorPayout(vendorId);

            return ResponseEntity.ok(payout);

        } catch (IllegalStateException e) {

            return ResponseEntity.badRequest().body(
                    Map.of(
                            "message",
                            e.getMessage()
                    )
            );
        }
    }

    // --------------------------------------------------------
    // PROCESS ALL VENDOR PAYOUTS
    // --------------------------------------------------------

    @PostMapping("/payouts/process-all")
    public ResponseEntity<List<VendorPayout>> processAllPayouts() {

        List<VendorPayout> payouts =
                payoutService.processAllVendorPayouts();

        return ResponseEntity.ok(payouts);
    }

    // --------------------------------------------------------
    // COMMISSION / FINANCE REPORT
    // --------------------------------------------------------

    @GetMapping("/commission/report")
    public ResponseEntity<Map<String, Object>> getCommissionReport() {

        List<VendorPayout> allPayouts =
                payoutService.getAllPayouts();

        BigDecimal totalGrossSales =
                allPayouts.stream()
                        .map(VendorPayout::getGrossSales)
                        .filter(value -> value != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalCommissionDeducted =
                allPayouts.stream()
                        .map(VendorPayout::getCommissionDeducted)
                        .filter(value -> value != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalTdsDeducted =
                allPayouts.stream()
                        .map(VendorPayout::getTdsDeducted)
                        .filter(value -> value != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        BigDecimal totalNetPayout =
                allPayouts.stream()
                        .map(VendorPayout::getNetPayout)
                        .filter(value -> value != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        Map<String, Object> report =
                new HashMap<>();

        report.put(
                "totalPayouts",
                allPayouts.size()
        );

        report.put(
                "totalGrossSales",
                totalGrossSales
        );

        report.put(
                "totalCommissionDeducted",
                totalCommissionDeducted
        );

        report.put(
                "totalTdsDeducted",
                totalTdsDeducted
        );

        report.put(
                "totalNetPayout",
                totalNetPayout
        );

        report.put(
                "payoutsList",
                allPayouts
        );

        return ResponseEntity.ok(report);
    }
}

//
//
//package com.examly.springapp.controller;
//
//import com.examly.springapp.entity.VendorPayout;
//import com.examly.springapp.service.PayoutService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api")
//@CrossOrigin(origins = "*")
//public class PayoutController {
//
//    @Autowired
//    private PayoutService payoutService;
//
//    @GetMapping("/payouts/vendor/{vendorId}")
//    public ResponseEntity<List<VendorPayout>> getVendorPayouts(@PathVariable Long vendorId) {
//        return ResponseEntity.ok(payoutService.getPayoutsByVendor(vendorId));
//    }
//
//    @PostMapping("/payouts/process")
//    public ResponseEntity<VendorPayout> processPayout(@RequestBody Map<String, Long> body) {
//        Long vendorId = body.get("vendorId");
//        VendorPayout payout = payoutService.processVendorPayout(vendorId);
//        return ResponseEntity.ok(payout);
//    }
//
//    @GetMapping("/commission/report")
//    public ResponseEntity<Map<String, Object>> getCommissionReport() {
//        List<VendorPayout> allPayouts = payoutService.getAllPayouts();
//        Map<String, Object> report = new HashMap<>();
//        report.put("totalPayouts", allPayouts.size());
//        report.put("totalGrossSales", allPayouts.stream().map(VendorPayout::getGrossSales).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
//        report.put("totalCommissionDeducted", allPayouts.stream().map(VendorPayout::getCommissionDeducted).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
//        report.put("totalTdsDeducted", allPayouts.stream().map(VendorPayout::getTdsDeducted).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
//        report.put("payoutsList", allPayouts);
//        return ResponseEntity.ok(report);
//    }
//}
