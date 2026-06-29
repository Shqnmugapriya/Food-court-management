package com.campus.foodcourt.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    private String id; // e.g. order-17382103810

    private String token; // e.g. A101, W201
    private String studentName;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    private double total;
    private double tax;
    private double serviceCharge;
    private double grandTotal;

    private String status; // Pending, Preparing, Packaging, Ready, Completed, Cancelled
    private String diningOption; // dine-in, takeaway
    private String pickupTime;
    private String specialInstructions;
    
    private String timeOrdered; // ISO timestamp
    private double sustainabilitySaved = 0.00;
    private int pointsEarned = 0;
    
    private Long expectedReadyTime; // Millisecond timestamp

    public Order() {}

    public Order(String id, String token, String studentName, List<OrderItem> items, double total, double tax, double serviceCharge, double grandTotal, String status, String diningOption, String pickupTime, String specialInstructions, String timeOrdered, double sustainabilitySaved, int pointsEarned, Long expectedReadyTime) {
        this.id = id;
        this.token = token;
        this.studentName = studentName;
        this.items = items;
        this.total = total;
        this.tax = tax;
        this.serviceCharge = serviceCharge;
        this.grandTotal = grandTotal;
        this.status = status;
        this.diningOption = diningOption;
        this.pickupTime = pickupTime;
        this.specialInstructions = specialInstructions;
        this.timeOrdered = timeOrdered;
        this.sustainabilitySaved = sustainabilitySaved;
        this.pointsEarned = pointsEarned;
        this.expectedReadyTime = expectedReadyTime;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }

    public double getServiceCharge() { return serviceCharge; }
    public void setServiceCharge(double serviceCharge) { this.serviceCharge = serviceCharge; }

    public double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(double grandTotal) { this.grandTotal = grandTotal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDiningOption() { return diningOption; }
    public void setDiningOption(String diningOption) { this.diningOption = diningOption; }

    public String getPickupTime() { return pickupTime; }
    public void setPickupTime(String pickupTime) { this.pickupTime = pickupTime; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public String getTimeOrdered() { return timeOrdered; }
    public void setTimeOrdered(String timeOrdered) { this.timeOrdered = timeOrdered; }

    public double getSustainabilitySaved() { return sustainabilitySaved; }
    public void setSustainabilitySaved(double sustainabilitySaved) { this.sustainabilitySaved = sustainabilitySaved; }

    public int getPointsEarned() { return pointsEarned; }
    public void setPointsEarned(int pointsEarned) { this.pointsEarned = pointsEarned; }

    public Long getExpectedReadyTime() { return expectedReadyTime; }
    public void setExpectedReadyTime(Long expectedReadyTime) { this.expectedReadyTime = expectedReadyTime; }
}
