package com.academy.football_academy_backend.repository;

import com.academy.football_academy_backend.model.Kid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KidRepository extends JpaRepository<Kid, Long> {
    List<Kid> findByParentUserId(Long parentId);

    Optional<Kid> findByCode(String code);
    List<Kid> findByParentUserIdAndStatus(Long parentId, Kid.Status status);
}
