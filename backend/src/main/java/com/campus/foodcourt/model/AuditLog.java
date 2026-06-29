package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String timestamp; // ISO Date String
    private String user;
    private String event;
    private String details;

    public AuditLog() {}

    public AuditLog(String timestamp, String user, String event, String details) {
        this.timestamp = timestamp;
        this.user = user;
        this.event = event;
        this.details = details;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getEvent() { return event; }
    public void setEvent(String event) { this.event = event; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
