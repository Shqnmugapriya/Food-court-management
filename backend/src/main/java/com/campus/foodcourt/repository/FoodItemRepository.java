package com.campus.foodcourt.repository;

import com.campus.foodcourt.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodItemRepository extends JpaRepository<FoodItem, String> {
}
