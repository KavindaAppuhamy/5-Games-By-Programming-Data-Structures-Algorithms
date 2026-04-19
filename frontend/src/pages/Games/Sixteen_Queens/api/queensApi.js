import axios from "axios";

const API = axios.create({
    baseURL: "/api/queens",
    headers: { "Content-Type": "application/json" },
});

export const runSequential  = ()                          => API.post("/solve/sequential");
export const runThreaded    = ()                          => API.post("/solve/threaded");
export const getComparison  = ()                          => API.get("/solve/compare");
export const submitSolution = (playerName, placement)     => API.post("/submit", { playerName, placement });
export const getSolutions   = ()                          => API.get("/solutions");
export const getLeaderboard = ()                          => API.get("/leaderboard");

export default API;