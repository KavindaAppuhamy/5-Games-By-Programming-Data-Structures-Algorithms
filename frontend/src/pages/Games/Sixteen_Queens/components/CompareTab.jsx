import { useEffect, useState } from "react";
import { FiRefreshCw, FiInfo } from "react-icons/fi";
import { getComparison } from "../api/queensApi.js";
import {BiBarChartAlt2} from "react-icons/bi";

export default function CompareTab({ seqResult, thrResult }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

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

            <button
                onClick={() => {
                    setLoading(true);
                    getComparison()
                        .then(({ data: d }) => setData(d))
                        .finally(() => setLoading(false));
                }}
                className="flex items-center gap-2 text-sm"
            >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                Refresh
            </button>
        </div>
    );
}