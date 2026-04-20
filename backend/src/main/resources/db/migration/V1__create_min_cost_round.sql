CREATE TABLE IF NOT EXISTS min_cost_round (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    player_name VARCHAR(255),
    n INTEGER NOT NULL,
    min_cost INTEGER,
    max_cost INTEGER,
    seed BIGINT,
    algorithm VARCHAR(64),
    total_cost BIGINT,
    runtime_ms BIGINT,
    assignments TEXT,
    comparison_results TEXT
);

CREATE INDEX IF NOT EXISTS idx_min_cost_round_created_at ON min_cost_round(created_at);
CREATE INDEX IF NOT EXISTS idx_min_cost_round_player_name ON min_cost_round(player_name);
CREATE INDEX IF NOT EXISTS idx_min_cost_round_player_name_lower_trim ON min_cost_round ((LOWER(TRIM(COALESCE(player_name, '')))));

