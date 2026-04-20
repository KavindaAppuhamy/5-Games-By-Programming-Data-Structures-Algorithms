package com.pdsagame.backend.queens.repository;

import com.pdsagame.backend.queens.entity.SolverRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SolverRunRepository extends JpaRepository<SolverRun, Long> {

    Optional<SolverRun> findTopBySolverTypeOrderByRanAtDesc(SolverRun.SolverType solverType);
}