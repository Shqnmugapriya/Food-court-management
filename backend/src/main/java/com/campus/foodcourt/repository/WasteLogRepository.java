package com.campus.foodcourt.repository;

import com.campus.foodcourt.model.WasteLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WasteLogRepository extends JpaRepository<WasteLog, String> {
}
