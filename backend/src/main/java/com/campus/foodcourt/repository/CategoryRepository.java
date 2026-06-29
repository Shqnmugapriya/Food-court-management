package com.campus.foodcourt.repository;

import com.campus.foodcourt.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {
}
