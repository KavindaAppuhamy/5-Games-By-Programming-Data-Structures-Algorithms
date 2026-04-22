
CREATE TABLE players (
    id BIGINT PRIMARY KEY,
    name VARCHAR,
    created_at TIMESTAMP
);

CREATE TABLE game_rounds (
    id BIGINT PRIMARY KEY,
    board_size INT,
    min_dice_throws INT,
    bfs_time_ns BIGINT,
    dijkstra_time_ns BIGINT,
    ladders_config VARCHAR,
    snakes_config VARCHAR,
    created_at TIMESTAMPTZ
);

CREATE TABLE player_results (
    id BIGINT PRIMARY KEY,
    player_id BIGINT,
    game_round_id BIGINT,
    board_size INT,
    correct_answer INT,
    player_answer INT,
    is_correct BOOLEAN,
    time_taken_seconds BIGINT,
    answered_at TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (game_round_id) REFERENCES game_rounds(id)
);




