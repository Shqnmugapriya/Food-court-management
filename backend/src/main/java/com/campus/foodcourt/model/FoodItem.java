package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "foods")
public class FoodItem {
    @Id
    private String id; // manual IDs f1, f2, f3 etc.

    private String name;
    
    @Column(length = 500)
    private String description;
    
    private double price;
    private String category;
    private int cookingTime;
    private double carbonFootprint;
    
    private boolean isEco;
    private boolean isJain;
    private boolean availability;
    private double rating = 4.5;

    public FoodItem() {}

    public FoodItem(String id, String name, String description, double price, String category, int cookingTime, double carbonFootprint, boolean isEco, boolean isJain, boolean availability, double rating) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.cookingTime = cookingTime;
        this.carbonFootprint = carbonFootprint;
        this.isEco = isEco;
        this.isJain = isJain;
        this.availability = availability;
        this.rating = rating;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getCookingTime() { return cookingTime; }
    public void setCookingTime(int cookingTime) { this.cookingTime = cookingTime; }

    public double getCarbonFootprint() { return carbonFootprint; }
    public void setCarbonFootprint(double carbonFootprint) { this.carbonFootprint = carbonFootprint; }

    public boolean getIsEco() { return isEco; }
    public void setIsEco(boolean eco) { isEco = eco; }

    public boolean getIsJain() { return isJain; }
    public void setIsJain(boolean jain) { isJain = jain; }

    public boolean getAvailability() { return availability; }
    public void setAvailability(boolean availability) { this.availability = availability; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
}
