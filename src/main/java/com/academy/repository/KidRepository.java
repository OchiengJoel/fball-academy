package com.academy.repository;

import com.academy.model.Kid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KidRepository extends JpaRepository<Kid, Long> {
    List<Kid> findByParentUserId(Long parentId);
}
