package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "waste_logs")
public class WasteLog {
    @Id
    private String id; // w1, w2 etc.

    private String name;
    private int qty;
    private String destination;
    private String date;

    public WasteLog() {}

    public WasteLog(String id, String name, int qty, String destination, String date) {
        this.id = id;
        this.name = name;
        this.qty = qty;
        this.destination = destination;
        this.date = date;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
