package com.examly.springapp.controller;

import com.examly.springapp.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/gmv")
    public ResponseEntity<Map<String, Object>> getGMV() {
        return ResponseEntity.ok(analyticsService.getGMVAnalytics());
    }

    @GetMapping("/funnel")
    public ResponseEntity<Map<String, Object>> getConversionFunnel() {
        return ResponseEntity.ok(analyticsService.getConversionFunnel());
    }

    @GetMapping("/vendor-scorecard")
    public ResponseEntity<Map<String, Object>> getVendorScorecard() {
        return ResponseEntity.ok(analyticsService.getVendorScorecard());
    }
}
