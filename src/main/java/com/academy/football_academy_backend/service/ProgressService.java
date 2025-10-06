package com.academy.football_academy_backend.service;

import com.academy.football_academy_backend.model.Progress;
import com.academy.football_academy_backend.repository.KidRepository;
import com.academy.football_academy_backend.repository.ProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final ProgressRepository progressRepository;
    private final KidRepository kidRepository;

    public Progress addProgress(Progress progress) {
        if (!kidRepository.existsById(progress.getKid().getKidId())) {
            throw new RuntimeException("Kid not found");
        }
        return progressRepository.save(progress);
    }

    public Page<Progress> getProgressForKid(Long kidId, LocalDate start, LocalDate end, Pageable pageable) {
        return progressRepository.findByKidKidIdAndDateBetween(kidId, start, end, pageable);
    }

    public List<Progress> getProgressForKid(Long kidId, LocalDate start, LocalDate end) {
        return progressRepository.findByKidKidIdAndDateBetween(kidId, start, end);
    }
}
