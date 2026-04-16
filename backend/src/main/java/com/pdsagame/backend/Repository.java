package com.pdsagame.backend;

import org.springframework.data.jpa.repository.JpaRepository;

public interface Repository extends JpaRepository<GameResult, Long> {
}