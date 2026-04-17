package com.pdsagame.backend.Minimum_Cost_Assignment.repository;

import com.pdsagame.backend.Minimum_Cost_Assignment.model.MinCostRound;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MinCostRoundRepository extends JpaRepository<MinCostRound, UUID> {
}

