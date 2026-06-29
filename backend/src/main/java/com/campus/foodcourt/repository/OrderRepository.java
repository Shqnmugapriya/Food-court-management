package com.campus.foodcourt.repository;

import com.campus.foodcourt.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, String> {
}
