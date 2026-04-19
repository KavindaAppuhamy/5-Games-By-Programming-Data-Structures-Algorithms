import { useEffect, useState } from "react";
import {FiRefreshCw, FiInfo, FiZap, FiAlertTriangle} from "react-icons/fi";
import {getAll, getComparison} from "../api/queensApi.js";
import {BiBarChartAlt2} from "react-icons/bi";
import {
    LineChart, Line,
    BarChart, Bar,
    XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid, Legend, ReferenceLine
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function CompareTab({ seqResult, thrResult }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [runs, setRuns] = useState([]);
    const [showAllRuns, setShowAllRuns] = useState(false);
    const [chartType, setChartType] = useState("line"); // line | bar

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const { data: d } = await getComparison();
                if (isMounted) setData(d);
            } catch {
                if (isMounted) {
                    setData({ sequential: seqResult, threaded: thrResult });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        setLoading(true); // still okay here because it's before async boundary
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [seqResult, thrResult]);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const [{ data: comp }, { data: allRuns }] = await Promise.all([
                    getComparison(),
                    getAll()
                ]);

                if (isMounted) {
                    setData(comp);
                    setRuns(allRuns);
                }
            } catch {
                if (isMounted) {
                    setData({ sequential: seqResult, threaded: thrResult });
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        setLoading(true);
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [seqResult, thrResult]);

    const visibleRuns = (showAllRuns ? runs : runs.slice(-20));

    // pair sequential + threaded
    const chartData = [];
    for (let i = 0; i < visibleRuns.length; i += 2) {
        const seq = visibleRuns[i]?.solverType === "SEQUENTIAL"
            ? visibleRuns[i]
            : visibleRuns[i + 1];

        const thr = visibleRuns[i]?.solverType === "THREADED"
            ? visibleRuns[i]
            : visibleRuns[i + 1];

        chartData.push({
            index: chartData.length + 1,
            sequential: seq?.executionTimeMs ?? null,
            threaded: thr?.executionTimeMs ?? null,
        });
    }

    const seqTimes = chartData.map(d => d.sequential).filter(Boolean);
    const thrTimes = chartData.map(d => d.threaded).filter(Boolean);

    const avgSeq = seqTimes.reduce((a, b) => a + b, 0) / (seqTimes.length || 1);
    const avgThr = thrTimes.reduce((a, b) => a + b, 0) / (thrTimes.length || 1);

    const bestSeq = Math.min(...seqTimes);
    const bestThr = Math.min(...thrTimes);

    const exportPNG = async () => {
        const el = document.getElementById("chart-container");
        const canvas = await html2canvas(el);
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvas.toDataURL();
        link.click();
    };

    const exportPDF = async () => {
        const el = document.getElementById("chart-container");
        const canvas = await html2canvas(el);
        const img = canvas.toDataURL("image/png");

        const pdf = new jsPDF();
        pdf.addImage(img, "PNG", 10, 10, 180, 100);
        pdf.save("chart.pdf");
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || payload.length === 0) return null;

        return (
            <div className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 shadow-lg">
                <p className="text-xs text-gray-400 mb-1">
                    Run #{label}
                </p>

                {payload.map((entry, i) => (
                    <div key={i} className="flex justify-between gap-4 text-xs">
                    <span
                        className={`${
                            entry.dataKey === "sequential"
                                ? "text-blue-400"
                                : "text-emerald-400"
                        }`}
                    >
                        {entry.name}
                    </span>
                        <span className="text-white font-mono">
                        {entry.value} ms
                    </span>
                    </div>
                ))}
            </div>
        );
    };

    const seq = data?.sequential;
    const thr = data?.threaded;

    if (!seq || !thr) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                <div className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30 mb-4 animate-pulse">
                    <BiBarChartAlt2 size={28} className="text-white" />
                </div>

                <p className="text-lg font-medium text-white">
                    Run both solvers first
                </p>

                <p className="text-sm mt-2 text-gray-400 text-center max-w-sm">
                    Go to the Solver tab and run Sequential, then Threaded.
                </p>
            </div>
        );
    }

    const seqMs = seq.executionTimeMs;
    const thrMs = thr.executionTimeMs;
    //const maxTime = Math.max(seqMs, thrMs);
    const ratio = seqMs / thrMs;
    const thrFaster = ratio >= 1;
    const speedup = thrFaster ? ratio.toFixed(2) : (1 / ratio).toFixed(2);

    const resultCategory = (() => {
        if (thrFaster && ratio >= 2) return "significant";
        if (thrFaster && ratio >= 1) return "marginal";
        if (!thrFaster && ratio < 0.5) return "much_slower";
        return "slightly_slower";
    })();

    const explanations = {
        significant:
            "The threaded solver clearly outperforms the sequential one here — the search space was distributed effectively across workers with minimal synchronisation overhead.",
        marginal:
            "The threaded solver edged out the sequential one. With a workload this small (500 solutions) the benefit of parallelism is modest.",
        slightly_slower:
            "Thread-management overhead (pool creation, task dispatch, future.get()) exceeded the parallelism gain for this run.",
        much_slower:
            "The threaded solver was significantly slower this run. This typically happens on the very first call (JVM warmup / JIT cold start) or when the machine has few physical cores.",
    };

    return (
        <div className="space-y-6">

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        setLoading(true);
                        getComparison()
                            .then(({ data: d }) => setData(d))
                            .finally(() => setLoading(false));
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition cursor-pointer"
                >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div
                className={`rounded-2xl p-5 text-center border ${
                    thrFaster
                        ? "bg-emerald-900/30 border-emerald-700/50"
                        : "bg-orange-900/30 border-orange-700/50"
                }`}
            >
                <p
                    className={`text-3xl font-extrabold ${
                        thrFaster ? "text-emerald-400" : "text-orange-400"
                    }`}
                >
                    {thrFaster
                        ? `⚡ Threaded ${speedup}× faster`
                        : `⚠ Sequential ${speedup}× faster`}
                </p>
                <p
                    className={`text-sm mt-1 ${
                        thrFaster
                            ? "text-emerald-300/70"
                            : "text-orange-300/70"
                    }`}
                >
                    {seqMs}ms sequential vs {thrMs}ms threaded
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div
                    className={`bg-gray-900 border rounded-2xl p-6 border-t-4 ${
                        !thrFaster
                            ? "border-t-blue-400 border-blue-700/40"
                            : "border-t-blue-600 border-gray-700/60"
                    }`}
                >
                    <h3 className="text-sm font-semibold text-blue-400 mb-4">
                        Sequential
                    </h3>
                    <div className="text-3xl font-bold">
                        {seqMs}
                        <span className="text-base text-gray-400 ml-1">ms</span>
                    </div>
                    <div className="text-3xl font-bold mt-4">
                        {seq.solutionsFound}
                    </div>
                </div>

                <div
                    className={`bg-gray-900 border rounded-2xl p-6 border-t-4 ${
                        thrFaster
                            ? "border-t-emerald-400 border-emerald-700/40"
                            : "border-t-orange-600 border-gray-700/60"
                    }`}
                >
                    <h3 className="text-sm font-semibold text-emerald-400 mb-4">
                        Threaded
                    </h3>
                    <div className="text-3xl font-bold">
                        {thrMs}
                        <span className="text-base text-gray-400 ml-1">ms</span>
                    </div>
                    <div className="text-3xl font-bold mt-4">
                        {thr.solutionsFound}
                    </div>
                </div>
            </div>

            <div className="bg-gray-900 border rounded-2xl p-6">
                <p>{explanations[resultCategory]}</p>
            </div>

            <div className="flex items-start gap-3">
                <FiInfo />
                <p className="text-sm text-gray-400">
                    Performance depends on CPU cores and JVM warmup.
                </p>
            </div>

            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                        Performance Trend (Last {visibleRuns.length})
                    </h3>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartType("line")}
                            className={`px-3 py-1 rounded-lg text-xs border ${
                                chartType === "line"
                                    ? "bg-blue-600 border-blue-400"
                                    : "bg-gray-800 border-gray-600"
                            }`}
                        >
                            Line
                        </button>
                        <button
                            onClick={() => setChartType("bar")}
                            className={`px-3 py-1 rounded-lg text-xs border ${
                                chartType === "bar"
                                    ? "bg-emerald-600 border-emerald-400"
                                    : "bg-gray-800 border-gray-600"
                            }`}
                        >
                            Bar
                        </button>
                    </div>
                </div>

                <div className="w-full h-72" id="chart-container">
                    <ResponsiveContainer>
                        {chartType === "line" ? (
                            <LineChart data={chartData}>
                                <CartesianGrid stroke="#374151" />

                                <XAxis dataKey="index" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />

                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                {/* Sequential */}
                                <Line
                                    type="monotone"
                                    dataKey="sequential"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    name="Sequential"
                                    dot={({ payload }) => (
                                        <circle
                                            r={3}
                                            fill={
                                                payload.sequential === bestSeq
                                                    ? "#F59E0B"
                                                    : "#3B82F6"
                                            }
                                        />
                                    )}
                                />

                                {/* Threaded */}
                                <Line
                                    type="monotone"
                                    dataKey="threaded"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    name="Threaded"
                                    dot={({ payload }) => (
                                        <circle
                                            r={3}
                                            fill={
                                                payload.threaded === bestThr
                                                    ? "#F59E0B"
                                                    : "#10B981"
                                            }
                                        />
                                    )}
                                />

                                {/* Avg lines */}
                                <ReferenceLine
                                    y={avgSeq}
                                    stroke="#3B82F6"
                                    strokeDasharray="4 4"
                                    label="Avg Seq"
                                />

                                <ReferenceLine
                                    y={avgThr}
                                    stroke="#10B981"
                                    strokeDasharray="4 4"
                                    label="Avg Thr"
                                />
                            </LineChart>
                        ) : (
                            <BarChart data={chartData}>
                                <CartesianGrid stroke="#374151" />
                                <XAxis dataKey="index" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />

                                <Bar dataKey="sequential" fill="#3B82F6" name="Sequential" />
                                <Bar dataKey="threaded" fill="#10B981" name="Threaded" />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-center">
                    {/* Sequential */}
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-blue-400 mb-1">Sequential</p>

                        <p className="text-xs text-gray-400">Best</p>
                        <p className="text-lg font-bold text-emerald-400">
                            {bestSeq ?? "-"} ms
                        </p>

                        <p className="text-xs text-gray-400 mt-2">Avg</p>
                        <p className="text-sm font-semibold text-yellow-400">
                            {avgSeq ? avgSeq.toFixed(1) : "-"} ms
                        </p>
                    </div>

                    {/* Threaded */}
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-emerald-400 mb-1">Threaded</p>

                        <p className="text-xs text-gray-400">Best</p>
                        <p className="text-lg font-bold text-emerald-400">
                            {bestThr ?? "-"} ms
                        </p>

                        <p className="text-xs text-gray-400 mt-2">Avg</p>
                        <p className="text-sm font-semibold text-yellow-400">
                            {avgThr ? avgThr.toFixed(1) : "-"} ms
                        </p>
                    </div>

                    {/* Overall */}
                    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                        <p className="text-xs text-purple-400 mb-1">Overview</p>

                        <p className="text-xs text-gray-400">Runs</p>
                        <p className="text-lg font-bold text-white">
                            {visibleRuns.length}
                        </p>

                        <p className="text-xs text-gray-400 mt-2">Better</p>
                        <p className="flex justify-center text-sm font-semibold">
                            {avgThr < avgSeq ? (
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <FiZap className="w-4 h-4" />
                                    Threaded
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-blue-400">
                                    <FiAlertTriangle className="w-4 h-4" />
                                    Sequential
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={exportPNG}
                    className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-xs"
                >
                    Export PNG
                </button>
                <button
                    onClick={exportPDF}
                    className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-600 text-xs"
                >
                    Export PDF
                </button>
            </div>

            <div className="bg-gray-900 border border-gray-700/60 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-widest">
                        Run History ({runs.length})
                    </h3>

                    <button
                        onClick={() => setShowAllRuns(prev => !prev)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition cursor-pointer"
                    >
                        {showAllRuns ? "Show Less" : "Show All"}
                    </button>
                </div>

                {runs.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                        No runs available
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="py-2">#</th>
                                <th>Type</th>
                                <th>Solutions</th>
                                <th>Time (ms)</th>
                                <th>Ran At</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(showAllRuns ? runs : runs.slice(0, 20)).map((r, i) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-gray-800 hover:bg-gray-800/50"
                                >
                                    <td className="py-2 text-gray-500">{i + 1}</td>
                                    <td
                                        className={`font-medium ${
                                            r.solverType === "THREADED"
                                                ? "text-emerald-400"
                                                : "text-blue-400"
                                        }`}
                                    >
                                        {r.solverType}
                                    </td>
                                    <td>{r.solutionsFound}</td>
                                    <td className="font-mono">{r.executionTimeMs}</td>
                                    <td className="text-gray-400 text-xs">
                                        {new Date(r.ranAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {runs.length > 20 && (
                    <div className="mt-4 text-center">
                        <button
                            onClick={() => setShowAllRuns(prev => !prev)}
                            className="text-xs text-gray-400 hover:text-white transition"
                        >
                            {showAllRuns ? "Show First 20" : `Show All (${runs.length})`}
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}