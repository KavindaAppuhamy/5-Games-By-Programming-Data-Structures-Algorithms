package com.pdsagame.backend.TrafficSimulation.repository;

import com.pdsagame.backend.TrafficSimulation.model.GameResult;

import org.springframework.data.jpa.repository.JpaRepository;

public interface Repository extends JpaRepository<GameResult, Long> {
}
