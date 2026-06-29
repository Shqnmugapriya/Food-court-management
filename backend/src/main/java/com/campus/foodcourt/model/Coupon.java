package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code; // e.g. FESTIVE30
    private int discount; // percentage
    private String type; // Campaign description

    public Coupon() {}

    public Coupon(String code, int discount, String type) {
        this.code = code;
        this.discount = discount;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getDiscount() { return discount; }
    public void setDiscount(int discount) { this.discount = discount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
