package com.pdsagame.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private Repository repository;

	@Test
	void contextLoads() {
	}

	@Test
	void testGameResultSave() {
		// Create a test GameResult
		GameResult result = new GameResult();
		result.setPlayerName("Test Player");
		result.setGuessedValue(10);
		result.setCorrectValue(15);
		result.setWin(false);
		result.setEdmondsKarpTimeMs(5L);
		result.setDinicTimeMs(3L);

		// Save it
		GameResult saved = repository.save(result);

		// Verify it was saved with times
		assertThat(saved.getId()).isNotNull();
		assertThat(saved.getEdmondsKarpTimeMs()).isEqualTo(5L);
		assertThat(saved.getDinicTimeMs()).isEqualTo(3L);

		// Clean up
		repository.delete(saved);
	}

}
