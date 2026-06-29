package com.campus.foodcourt.controller;

import com.campus.foodcourt.config.WebSocketConfig;
import com.campus.foodcourt.model.*;
import com.campus.foodcourt.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminFeaturesController {

    private final ShiftRosterRepository shiftRosterRepository;
    private final WasteLogRepository wasteLogRepository;
    private final CouponRepository couponRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminFeaturesController(ShiftRosterRepository shiftRosterRepository, WasteLogRepository wasteLogRepository,
                                   CouponRepository couponRepository, AuditLogRepository auditLogRepository) {
        this.shiftRosterRepository = shiftRosterRepository;
        this.wasteLogRepository = wasteLogRepository;
        this.couponRepository = couponRepository;
        this.auditLogRepository = auditLogRepository;
    }

    // 1. Shift Roster
    @GetMapping("/roster")
    public List<ShiftRoster> getRoster() {
        return shiftRosterRepository.findAll();
    }

    @PostMapping("/roster")
    public ResponseEntity<?> addRoster(@RequestBody ShiftRoster roster) {
        if (roster.getId() == null || roster.getId().isEmpty()) {
            roster.setId("r-" + System.currentTimeMillis());
        }
        ShiftRoster saved = shiftRosterRepository.save(roster);
        
        auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Shift Scheduled", 
                "Scheduled shift for " + roster.getName() + " on " + roster.getCounter()));
        
        WebSocketConfig.broadcastReload();
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/roster/{id}")
    public ResponseEntity<?> deleteRoster(@PathVariable String id) {
        if (shiftRosterRepository.existsById(id)) {
            shiftRosterRepository.deleteById(id);
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Shift Cancelled", "Removed shift roster ID: " + id));
            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // 2. Leftover Waste Logs
    @GetMapping("/waste-logs")
    public List<WasteLog> getWasteLogs() {
        return wasteLogRepository.findAll();
    }

    @PostMapping("/waste-logs")
    public ResponseEntity<?> addWasteLog(@RequestBody WasteLog log) {
        if (log.getId() == null || log.getId().isEmpty()) {
            log.setId("w-" + System.currentTimeMillis());
        }
        log.setDate(Instant.now().toString().split("T")[0]);
        WasteLog saved = wasteLogRepository.save(log);

        auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Leftover Donated", 
                "Rescued leftovers: " + log.getName() + " x" + log.getQty() + " sent to " + log.getDestination()));

        WebSocketConfig.broadcastReload();
        return ResponseEntity.ok(saved);
    }

    // 3. Coupon Codes CRUD
    @GetMapping("/coupons")
    public List<Coupon> getCoupons() {
        return couponRepository.findAll();
    }

    @PostMapping("/coupons")
    public ResponseEntity<?> addCoupon(@RequestBody Coupon coupon) {
        if (couponRepository.findByCode(coupon.getCode().toUpperCase()).isPresent()) {
            return ResponseEntity.badRequest().body("Coupon code already exists.");
        }
        coupon.setCode(coupon.getCode().toUpperCase());
        Coupon saved = couponRepository.save(coupon);

        auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Coupon Created", 
                "Created coupon code: " + coupon.getCode() + " (" + coupon.getDiscount() + "% off)"));

        WebSocketConfig.broadcastReload();
        return ResponseEntity.ok(saved);
    }

    // 4. System Audit Logs
    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }
}
