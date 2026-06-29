package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "rosters")
public class ShiftRoster {
    @Id
    private String id; // manual IDs r1, r2 etc.

    private String name;
    private String counter;
    private String time;

    public ShiftRoster() {}

    public ShiftRoster(String id, String name, String counter, String time) {
        this.id = id;
        this.name = name;
        this.counter = counter;
        this.time = time;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCounter() { return counter; }
    public void setCounter(String counter) { this.counter = counter; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }
}
