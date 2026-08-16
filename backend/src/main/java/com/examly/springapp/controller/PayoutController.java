

package com.examly.springapp.controller;

import com.examly.springapp.entity.VendorPayout;
import com.examly.springapp.service.PayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PayoutController {

    @Autowired
    private PayoutService payoutService;

    @GetMapping("/payouts/vendor/{vendorId}")
    public ResponseEntity<List<VendorPayout>> getVendorPayouts(@PathVariable Long vendorId) {
        return ResponseEntity.ok(payoutService.getPayoutsByVendor(vendorId));
    }

    @PostMapping("/payouts/process")
    public ResponseEntity<VendorPayout> processPayout(@RequestBody Map<String, Long> body) {
        Long vendorId = body.get("vendorId");
        VendorPayout payout = payoutService.processVendorPayout(vendorId);
        return ResponseEntity.ok(payout);
    }

    @GetMapping("/commission/report")
    public ResponseEntity<Map<String, Object>> getCommissionReport() {
        List<VendorPayout> allPayouts = payoutService.getAllPayouts();
        Map<String, Object> report = new HashMap<>();
        report.put("totalPayouts", allPayouts.size());
        report.put("totalGrossSales", allPayouts.stream().map(VendorPayout::getGrossSales).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        report.put("totalCommissionDeducted", allPayouts.stream().map(VendorPayout::getCommissionDeducted).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        report.put("totalTdsDeducted", allPayouts.stream().map(VendorPayout::getTdsDeducted).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add));
        report.put("payoutsList", allPayouts);
        return ResponseEntity.ok(report);
    }
}
