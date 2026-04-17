package com.pdsagame.backend.Minimum_Cost_Assignment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveRequestDTO;
import com.pdsagame.backend.Minimum_Cost_Assignment.dto.SolveResultDTO;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for MinCostService
 * Tests the core functionality of algorithm execution, validation, and scoring
 */
class MinCostServiceTest {

    private MinCostService service;

    @BeforeEach
    void setUp() {
        // Create service with real algorithm implementations
        service = new MinCostService();

        // Manually inject dependencies using reflection for testing
        GreedySolver greedySolver = new GreedySolver();
        HungarianSolver hungarianSolver = new HungarianSolver();

        org.springframework.test.util.ReflectionTestUtils.setField(service, "greedySolver", greedySolver);
        org.springframework.test.util.ReflectionTestUtils.setField(service, "hungarianSolver", hungarianSolver);

        // Disable database persistence for testing
        org.springframework.test.util.ReflectionTestUtils.setField(service, "repository", null);
    }

    @Test
    void testSolveWithHungarianAlgorithm() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(5);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("hungarian");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        assertNotNull(result);
        assertEquals(5, result.getN());
        assertEquals("hungarian", result.getAlgorithm());
        assertTrue(result.getTotalCost() > 0);
        assertTrue(result.getRuntimeMs() >= 0);
        assertEquals(5, result.getAssignments().size());
    }

    @Test
    void testSolveWithGreedyAlgorithm() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(10);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("greedy");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        assertNotNull(result);
        assertEquals(10, result.getN());
        assertEquals("greedy", result.getAlgorithm());
        assertTrue(result.getTotalCost() > 0);
        assertTrue(result.getRuntimeMs() >= 0);
        assertEquals(10, result.getAssignments().size());
    }

    @Test
    void testRandomNGeneration() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(null); // Request random N
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("hungarian");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        assertNotNull(result);
        assertTrue(result.getN() >= 50 && result.getN() <= 100, "N should be between 50-100");
    }

    @Test
    void testBothAlgorithmsMode() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(8);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("both");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        assertNotNull(result);
        assertEquals("both", result.getAlgorithm());
        assertEquals(8, result.getN());
        assertTrue(result.getTotalCost() > 0);
    }

    @Test
    void testValidationInvalidN() {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(0);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("hungarian");

        assertThrows(IllegalArgumentException.class, () -> service.solve(request));
    }

    @Test
    void testValidationMinCostGreaterThanMaxCost() {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(5);
        request.setMinCost(200);
        request.setMaxCost(20);
        request.setAlgorithm("hungarian");

        assertThrows(IllegalArgumentException.class, () -> service.solve(request));
    }

    @Test
    void testUnknownAlgorithm() {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(5);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("unknown_algorithm");
        request.setPersist(false);

        assertThrows(IllegalArgumentException.class, () -> service.solve(request));
    }

    @Test
    void testSeedReproducibility() throws JsonProcessingException {
        SolveRequestDTO request1 = new SolveRequestDTO();
        request1.setN(10);
        request1.setMinCost(20);
        request1.setMaxCost(200);
        request1.setAlgorithm("hungarian");
        request1.setSeed(12345L);
        request1.setPersist(false);

        SolveRequestDTO request2 = new SolveRequestDTO();
        request2.setN(10);
        request2.setMinCost(20);
        request2.setMaxCost(200);
        request2.setAlgorithm("hungarian");
        request2.setSeed(12345L);
        request2.setPersist(false);

        SolveResultDTO result1 = service.solve(request1);
        SolveResultDTO result2 = service.solve(request2);

        assertEquals(result1.getTotalCost(), result2.getTotalCost(), "Same seed should produce same total cost");
    }

    @Test
    void testCostMatrixRangeValidation() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(5);
        request.setMinCost(50);
        request.setMaxCost(150);
        request.setAlgorithm("greedy");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        for (var assignment : result.getAssignments()) {
            assertTrue(assignment.getCost() >= 50, "Cost should be >= minCost");
            assertTrue(assignment.getCost() <= 150, "Cost should be <= maxCost");
        }
    }

    @Test
    void testRuntimeMeasurement() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(50);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("greedy");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        assertNotNull(result);
        assertTrue(result.getRuntimeMs() >= 0, "Runtime should be non-negative");
        assertTrue(result.getRuntimeMs() < 1000, "Greedy should complete in < 1 second");
    }

    @Test
    void testAssignmentValidity() throws JsonProcessingException {
        SolveRequestDTO request = new SolveRequestDTO();
        request.setN(6);
        request.setMinCost(20);
        request.setMaxCost(200);
        request.setAlgorithm("hungarian");
        request.setPersist(false);

        SolveResultDTO result = service.solve(request);

        // Verify all assignments are unique (one task per employee)
        java.util.Set<Integer> taskIndices = new java.util.HashSet<>();
        java.util.Set<Integer> agentIndices = new java.util.HashSet<>();

        for (var assignment : result.getAssignments()) {
            assertTrue(taskIndices.add(assignment.getTaskIndex()), "Each task should be assigned once");
            assertTrue(agentIndices.add(assignment.getAgentIndex()), "Each agent should get one task");
        }

        assertEquals(6, taskIndices.size());
        assertEquals(6, agentIndices.size());
    }
}

