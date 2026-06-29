package com.campus.foodcourt.config;

import com.campus.foodcourt.model.*;
import com.campus.foodcourt.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.List;

@Component
public class DbSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FoodItemRepository foodItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final ShiftRosterRepository shiftRosterRepository;
    private final WasteLogRepository wasteLogRepository;
    private final CouponRepository couponRepository;
    private final AuditLogRepository auditLogRepository;

    public DbSeeder(UserRepository userRepository, FoodItemRepository foodItemRepository,
                    InventoryItemRepository inventoryItemRepository, ShiftRosterRepository shiftRosterRepository,
                    WasteLogRepository wasteLogRepository, CouponRepository couponRepository,
                    AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.foodItemRepository = foodItemRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.shiftRosterRepository = shiftRosterRepository;
        this.wasteLogRepository = wasteLogRepository;
        this.couponRepository = couponRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0 || foodItemRepository.count() < 13 || foodItemRepository.findAll().stream().anyMatch(f -> f.getPrice() < 10.0)) {
            // Clear existing data to ensure new Rupee pricing seeps in correctly
            userRepository.deleteAll();
            foodItemRepository.deleteAll();
            inventoryItemRepository.deleteAll();
            shiftRosterRepository.deleteAll();
            wasteLogRepository.deleteAll();
            couponRepository.deleteAll();
            auditLogRepository.deleteAll();

            // Seed Users
            userRepository.save(new User("Priya Sharma", "priya.sharma@campus.edu", "priya123", "student", 120, "Silver Member", "Eco Starter, Salad Lover, Daily Champ"));
            userRepository.save(new User("Staff Member", "staff@campus.edu", "staff123", "staff", 0, "Counter Operator", ""));
            userRepository.save(new User("Administrator", "admin@campus.edu", "admin123", "admin", 0, "Director Sarah", ""));
            userRepository.save(new User("Cashier Operator", "cashier@campus.edu", "cashier123", "cashier", 0, "POS Cashier", ""));
            
            // Seed Foods (Prices > 10 Rupees)
            foodItemRepository.save(new FoodItem("f1", "Avocado Toast", "Fresh sliced avocado on healthy multi-grain toast with side arugula salad.", 120.00, "Breakfast", 5, 0.15, true, false, true, 4.6));
            foodItemRepository.save(new FoodItem("f2", "Spicy Chipotle Burrito", "Stuffed burrito wrap with brown rice, black beans, salsa and chipotle sauce.", 150.00, "Lunch", 7, 0.35, false, false, true, 4.8));
            foodItemRepository.save(new FoodItem("f3", "Quinoa Superfood Salad", "Nourishing greens with protein-packed quinoa, cucumber, and cherry tomatoes.", 140.00, "Lunch", 4, 0.10, true, true, true, 4.7));
            foodItemRepository.save(new FoodItem("f4", "Teriyaki Rice Bowl", "Choice protein glazed in savory teriyaki, served over jasmine rice and broccoli.", 180.00, "Dinner", 8, 0.50, false, false, true, 4.5));
            foodItemRepository.save(new FoodItem("f5", "Triple Chocolate Cake", "Decadent slices of triple layered moist chocolate fudge cake.", 90.00, "Desserts", 3, 0.25, false, false, true, 4.9));
            foodItemRepository.save(new FoodItem("f6", "Matcha Green Tea Latte", "Authentic premium stone-ground Uji matcha whisked with oat milk.", 80.00, "Drinks", 3, 0.08, true, true, true, 4.6));
            foodItemRepository.save(new FoodItem("f7", "Paneer Butter Masala", "Rich and creamy cottage cheese curry served with hot butter garlic naan.", 220.00, "Dinner", 10, 0.40, false, true, true, 4.8));
            foodItemRepository.save(new FoodItem("f8", "Garden Fresh Pizza", "Freshly baked thin-crust pizza topped with bell peppers, olives, corn, and mozzarella.", 260.00, "Dinner", 12, 0.30, false, false, true, 4.7));
            foodItemRepository.save(new FoodItem("f9", "Masala Dosa", "Crispy golden crepe stuffed with savory spiced potato mash, served with coconut chutney and sambar.", 110.00, "Breakfast", 6, 0.12, true, true, true, 4.8));
            foodItemRepository.save(new FoodItem("f10", "Garlic Bread Sticks", "Baked dough sticks brushed with garlic butter and herbs, served with warm cheese dip.", 90.00, "Breakfast", 5, 0.18, false, false, true, 4.5));
            foodItemRepository.save(new FoodItem("f11", "Chocolate Lava Cake", "Warm chocolate cake with a luscious molten chocolate center, served with vanilla scoop.", 120.00, "Desserts", 4, 0.22, false, false, true, 4.9));
            foodItemRepository.save(new FoodItem("f12", "Mango Lassi", "Traditional cooling yogurt drink blended with fresh sweet Alphonso mangoes.", 70.00, "Drinks", 3, 0.05, true, true, true, 4.8));
            foodItemRepository.save(new FoodItem("f13", "Iced Hazelnut Latte", "Chilled espresso poured over fresh milk and sweetened hazelnut syrup.", 90.00, "Drinks", 3, 0.09, true, false, true, 4.6));
 
            // Seed Inventory
            inventoryItemRepository.save(new InventoryItem("i1", "Avocado", 8, 10, "pcs"));
            inventoryItemRepository.save(new InventoryItem("i2", "Tortilla Wraps", 25, 15, "sheets"));
            inventoryItemRepository.save(new InventoryItem("i3", "Salad Leaves", 50, 20, "bags"));
            inventoryItemRepository.save(new InventoryItem("i4", "Rice", 80, 30, "kg"));
            inventoryItemRepository.save(new InventoryItem("i5", "Chocolate Blocks", 3, 5, "blocks"));
            inventoryItemRepository.save(new InventoryItem("i6", "Matcha Powder", 12, 5, "cans"));
 
            // Seed Shift Roster
            shiftRosterRepository.save(new ShiftRoster("r1", "Chef Mario", "Counter 1 - Fast Food", "11:00 AM - 4:00 PM"));
            shiftRosterRepository.save(new ShiftRoster("r2", "Assistant Julia", "Counter 2 - Salads", "11:30 AM - 3:30 PM"));
 
            // Seed Leftover Rescue
            wasteLogRepository.save(new WasteLog("w1", "Whole-wheat Buns", 12, "NGO Rescue Food", "2026-06-26"));
            wasteLogRepository.save(new WasteLog("w2", "Salad Mix", 4, "Campus Recovery NGO", "2026-06-25"));
 
            // Seed Coupons
            couponRepository.save(new Coupon("FESTIVE30", 30, "Festival discount campaign"));
            couponRepository.save(new Coupon("GREEN20", 20, "Eco-meal green discount"));
 
            // Seed Audit Logs
            auditLogRepository.save(new AuditLog(Instant.now().toString(), "SYSTEM", "Initialization", "Database seeded with initial default values in Indian Rupees (₹)."));
        }
    }
}
