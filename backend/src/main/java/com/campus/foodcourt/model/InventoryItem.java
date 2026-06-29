package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "inventory")
public class InventoryItem {
    @Id
    private String id; // manual IDs i1, i2 etc.

    private String name;
    private int stock;
    private int lowStockThreshold;
    private String unit;

    public InventoryItem() {}

    public InventoryItem(String id, String name, int stock, int lowStockThreshold, String unit) {
        this.id = id;
        this.name = name;
        this.stock = stock;
        this.lowStockThreshold = lowStockThreshold;
        this.unit = unit;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
}
