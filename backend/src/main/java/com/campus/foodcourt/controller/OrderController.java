package com.campus.foodcourt.controller;

import com.campus.foodcourt.config.WebSocketConfig;
import com.campus.foodcourt.model.*;
import com.campus.foodcourt.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public OrderController(OrderRepository orderRepository, UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> checkoutOrder(@RequestBody Order order) {
        if (order.getId() == null || order.getId().isEmpty()) {
            order.setId("order-" + System.currentTimeMillis());
        }
        
        // Generate Token
        String token = generateToken(order.getSpecialInstructions() != null && order.getSpecialInstructions().contains("POS"));
        order.setToken(token);
        order.setTimeOrdered(Instant.now().toString());
        order.setStatus("Pending");

        // Calculate expected ready time based on items or default to 5-10 minutes
        long defaultPrepDurationMs = 5 * 60 * 1000; // 5 mins
        order.setExpectedReadyTime(System.currentTimeMillis() + defaultPrepDurationMs);

        Order saved = orderRepository.save(order);

        // Update student loyalty points if they ordered through student portal
        if (order.getPointsEarned() > 0) {
            // Find student by email or username
            Optional<User> userOpt = userRepository.findByEmail(order.getStudentName());
            if (userOpt.isEmpty()) {
                // Try searching by username
                userOpt = userRepository.findAll().stream()
                        .filter(u -> u.getUsername().equalsIgnoreCase(order.getStudentName()))
                        .findFirst();
            }

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setLoyaltyPoints(user.getLoyaltyPoints() + order.getPointsEarned());
                // Update rank
                if (user.getLoyaltyPoints() >= 200) {
                    user.setLoyaltyRank("Gold Member");
                } else if (user.getLoyaltyPoints() >= 100) {
                    user.setLoyaltyRank("Silver Member");
                }
                userRepository.save(user);
            }
        }

        auditLogRepository.save(new AuditLog(Instant.now().toString(), order.getStudentName(), "Order Placed", 
                "Placed order token: " + token + ", Total: $" + String.format("%.2f", order.getGrandTotal())));

        WebSocketConfig.broadcastReload();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        Optional<Order> orderOpt = orderRepository.findById(id);
        
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            String oldStatus = order.getStatus();
            order.setStatus(newStatus);
            
            // Adjust expected ready time when transitioning to preparing
            if ("Preparing".equals(newStatus)) {
                // Set expected time to 3 minutes from now to simulate active countdowns!
                order.setExpectedReadyTime(System.currentTimeMillis() + (3 * 60 * 1000));
            }

            Order saved = orderRepository.save(order);

            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Staff", "Order Status Update", 
                    "Order token: " + order.getToken() + " shifted from " + oldStatus + " to " + newStatus));

            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    private synchronized String generateToken(boolean isPOS) {
        String prefix = isPOS ? "W" : "A";
        
        // Find maximum existing token number with this prefix
        int maxNum = 200; // default start values (A201, W201)
        List<Order> orders = orderRepository.findAll();
        for (Order o : orders) {
            if (o.getToken() != null && o.getToken().startsWith(prefix)) {
                try {
                    int num = Integer.parseInt(o.getToken().substring(1));
                    if (num > maxNum) {
                        maxNum = num;
                    }
                } catch (NumberFormatException ignored) {}
            }
        }
        return prefix + (maxNum + 1);
    }
}
