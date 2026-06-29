package com.campus.foodcourt.controller;

import com.campus.foodcourt.config.WebSocketConfig;
import com.campus.foodcourt.model.*;
import com.campus.foodcourt.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin(origins = "*")
public class FoodController {

    private final FoodItemRepository foodItemRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final AuditLogRepository auditLogRepository;

    public FoodController(FoodItemRepository foodItemRepository, CategoryRepository categoryRepository,
                          InventoryItemRepository inventoryItemRepository, AuditLogRepository auditLogRepository) {
        this.foodItemRepository = foodItemRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<FoodItem> getAllFoods() {
        return foodItemRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createFood(@RequestBody FoodItem food) {
        if (food.getId() == null || food.getId().isEmpty()) {
            food.setId("f-" + System.currentTimeMillis());
        }
        FoodItem saved = foodItemRepository.save(food);
        
        auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Food Created", "Created food item: " + food.getName()));
        WebSocketConfig.broadcastReload();
        
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFood(@PathVariable String id, @RequestBody FoodItem foodDetails) {
        Optional<FoodItem> foodOpt = foodItemRepository.findById(id);
        if (foodOpt.isPresent()) {
            FoodItem food = foodOpt.get();
            food.setName(foodDetails.getName());
            food.setDescription(foodDetails.getDescription());
            food.setPrice(foodDetails.getPrice());
            food.setCategory(foodDetails.getCategory());
            food.setCookingTime(foodDetails.getCookingTime());
            food.setCarbonFootprint(foodDetails.getCarbonFootprint());
            food.setIsEco(foodDetails.getIsEco());
            food.setIsJain(foodDetails.getIsJain());
            food.setAvailability(foodDetails.getAvailability());
            
            FoodItem saved = foodItemRepository.save(food);
            
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Food Updated", "Updated food item details: " + food.getName()));
            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFood(@PathVariable String id) {
        Optional<FoodItem> foodOpt = foodItemRepository.findById(id);
        if (foodOpt.isPresent()) {
            foodItemRepository.delete(foodOpt.get());
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Food Deleted", "Deleted food item ID: " + id));
            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Dynamic Categories CRUD
    @GetMapping("/categories")
    public List<String> getCategories() {
        List<Category> cats = categoryRepository.findAll();
        if (cats.isEmpty()) {
            // Seed defaults if empty
            List<String> defaults = Arrays.asList("Breakfast", "Lunch", "Dinner", "Snacks", "Drinks", "Desserts");
            defaults.forEach(c -> categoryRepository.save(new Category(c)));
            return defaults;
        }
        List<String> names = new ArrayList<>();
        cats.forEach(c -> names.add(c.getName()));
        return names;
    }

    @PostMapping("/categories")
    public ResponseEntity<?> addCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name is required.");
        }
        
        if (categoryRepository.existsById(name)) {
            return ResponseEntity.badRequest().body("Category already exists.");
        }
        
        Category saved = categoryRepository.save(new Category(name));
        auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Category Created", "Created food menu category: " + name));
        WebSocketConfig.broadcastReload();
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/categories/{name}")
    public ResponseEntity<?> deleteCategory(@PathVariable String name) {
        if (categoryRepository.existsById(name)) {
            categoryRepository.deleteById(name);
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Admin", "Category Deleted", "Deleted food menu category: " + name));
            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Inventory CRUD
    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() {
        return inventoryItemRepository.findAll();
    }

    @PutMapping("/inventory/{id}")
    public ResponseEntity<?> updateInventory(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        Optional<InventoryItem> itemOpt = inventoryItemRepository.findById(id);
        if (itemOpt.isPresent()) {
            InventoryItem item = itemOpt.get();
            item.setStock(body.get("stock"));
            InventoryItem saved = inventoryItemRepository.save(item);
            
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "Staff", "Stock Alert", "Adjusted pantry stock level for " + item.getName() + " to " + item.getStock() + " " + item.getUnit()));
            WebSocketConfig.broadcastReload();
            return ResponseEntity.ok(saved);
        }
        return ResponseEntity.notFound().build();
    }
}
