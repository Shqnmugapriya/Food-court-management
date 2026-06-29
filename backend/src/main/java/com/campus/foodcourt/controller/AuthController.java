package com.campus.foodcourt.controller;

import com.campus.foodcourt.config.WebSocketConfig;
import com.campus.foodcourt.model.AuditLog;
import com.campus.foodcourt.model.User;
import com.campus.foodcourt.repository.AuditLogRepository;
import com.campus.foodcourt.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;

    public AuthController(UserRepository userRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            User user = userOpt.get();
            
            // Log security audit trail
            auditLogRepository.save(new AuditLog(Instant.now().toString(), user.getUsername(), "Login Success", "Successfully authenticated user session."));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            // Simulate a session token
            response.put("token", Base64.getEncoder().encodeToString((user.getEmail() + ":" + user.getRole()).getBytes()));
            return ResponseEntity.ok(response);
        }

        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", "Invalid email or credentials matching.");
        return ResponseEntity.ok(error);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "student");

        if (userRepository.findByEmail(email).isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Email is already registered in database.");
            return ResponseEntity.ok(error);
        }

        User newUser = new User(username, email, password, role, 0, "Bronze Member", "Eco Starter");
        User saved = userRepository.save(newUser);
        
        auditLogRepository.save(new AuditLog(Instant.now().toString(), username, "Registration", "Registered new user: " + email + " as " + role));
        WebSocketConfig.broadcastReload();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", saved);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ranking")
    public ResponseEntity<?> getLeaderboard() {
        List<User> users = userRepository.findAll();
        // Sort by loyalty points descending
        users.sort((a, b) -> Integer.compare(b.getLoyaltyPoints(), a.getLoyaltyPoints()));
        return ResponseEntity.ok(users);
    }

    @PostMapping("/checkin")
    public ResponseEntity<?> claimDailyCheckin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLoyaltyPoints(user.getLoyaltyPoints() + 10);
            
            // Update ranks based on points
            if (user.getLoyaltyPoints() >= 200) {
                user.setLoyaltyRank("Gold Member");
            } else if (user.getLoyaltyPoints() >= 100) {
                user.setLoyaltyRank("Silver Member");
            }
            
            User saved = userRepository.save(user);
            auditLogRepository.save(new AuditLog(Instant.now().toString(), user.getUsername(), "Daily Check-in", "Claimed check-in reward. Awarded +10 Green Points."));
            WebSocketConfig.broadcastReload();

            return ResponseEntity.ok(saved);
        }
        
        return ResponseEntity.badRequest().body("User not found.");
    }
}
