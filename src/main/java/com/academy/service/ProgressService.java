package com.academy.service;

import com.academy.model.Progress;
import com.academy.repository.KidRepository;
import com.academy.repository.ProgressRepository;
import lombok.RequiredArgsConstructor;
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

    public List<Progress> getProgressForKid(Long kidId, LocalDate start, LocalDate end) {
        return progressRepository.findByKidKidIdAndDateBetween(kidId, start, end);
    }
}
