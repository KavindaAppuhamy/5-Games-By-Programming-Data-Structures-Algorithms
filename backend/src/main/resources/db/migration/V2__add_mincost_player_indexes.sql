CREATE INDEX IF NOT EXISTS idx_min_cost_round_player_name ON min_cost_round(player_name);
CREATE INDEX IF NOT EXISTS idx_min_cost_round_player_name_lower_trim ON min_cost_round ((LOWER(TRIM(COALESCE(player_name, '')))));


