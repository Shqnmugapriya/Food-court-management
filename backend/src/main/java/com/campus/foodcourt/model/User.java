package com.campus.foodcourt.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String email;

    private String username;
    private String password;
    private String role; // student, staff, admin, cashier

    private int loyaltyPoints = 0;
    private String loyaltyRank = "Bronze Member";
    private String badges = "Eco Starter"; // comma separated badges

    public User() {}

    public User(String username, String email, String password, String role, int loyaltyPoints, String loyaltyRank, String badges) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
        this.loyaltyPoints = loyaltyPoints;
        this.loyaltyRank = loyaltyRank;
        this.badges = badges;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public int getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public String getLoyaltyRank() { return loyaltyRank; }
    public void setLoyaltyRank(String loyaltyRank) { this.loyaltyRank = loyaltyRank; }

    public String getBadges() { return badges; }
    public void setBadges(String badges) { this.badges = badges; }
}
