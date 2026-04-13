import React, { useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// ============================================
// ALGORITHMS (same as yours)
// ============================================
const edmondsKarp = (graph, source, sink) => {
    const residualGraph = structuredClone(graph);
    const parent = {};
    let maxFlow = 0;

    const bfs = () => {
        const visited = new Set();
        const queue = [source];
        visited.add(source);

        while (queue.length) {
            const u = queue.shift();

            for (const v in (residualGraph[u] || {})) {
                if (!visited.has(v) && residualGraph[u][v] > 0) {
                    parent[v] = u;
                    visited.add(v);
                    if (v === sink) return true;
                    queue.push(v);
                }
            }
        }
        return false;
    };

    while (bfs()) {
        let flow = Infinity;

        for (let v = sink; v !== source; v = parent[v]) {
            flow = Math.min(flow, residualGraph[parent[v]][v]);
        }

        for (let v = sink; v !== source; v = parent[v]) {
            const u = parent[v];
            residualGraph[u][v] -= flow;

            if (!residualGraph[v]) residualGraph[v] = {};
            if (!residualGraph[v][u]) residualGraph[v][u] = 0;

            residualGraph[v][u] += flow;
        }

        maxFlow += flow;
    }

    return { maxFlow };
};

const dinicsAlgorithm = (graph, source, sink) => {
    const residualGraph = structuredClone(graph);
    const level = {};
    const start = {};
    let maxFlow = 0;

    const bfs = () => {
        for (let node in residualGraph) level[node] = -1;
        level[source] = 0;

        const queue = [source];

        while (queue.length) {
            const u = queue.shift();

            for (const v in (residualGraph[u] || {})) {
                if (level[v] < 0 && residualGraph[u][v] > 0) {
                    level[v] = level[u] + 1;
                    queue.push(v);
                }
            }
        }

        return level[sink] >= 0;
    };

    const dfs = (u, flow) => {
        if (u === sink) return flow;

        const neighbors = Object.keys(residualGraph[u] || {});

        for (; start[u] < neighbors.length; start[u]++) {
            const v = neighbors[start[u]];

            if (level[v] === level[u] + 1 && residualGraph[u][v] > 0) {
                const curr = Math.min(flow, residualGraph[u][v]);
                const temp = dfs(v, curr);

                if (temp > 0) {
                    residualGraph[u][v] -= temp;

                    if (!residualGraph[v]) residualGraph[v] = {};
                    if (!residualGraph[v][u]) residualGraph[v][u] = 0;

                    residualGraph[v][u] += temp;
                    return temp;
                }
            }
        }
        return 0;
    };

    while (bfs()) {
        for (let node in residualGraph) start[node] = 0;

        let flow;
        while ((flow = dfs(source, Infinity)) > 0) {
            maxFlow += flow;
        }
    }

    return { maxFlow };
};

// ============================================
// STYLED NODES
// ============================================
const nodeStyle = {
    background: '#1e293b',
    color: '#fff',
    border: '2px solid #3b82f6',
    borderRadius: '10px',
    padding: '10px',
    fontWeight: 'bold'
};

const nodesInit = [
    { id: 'A', position: { x: 100, y: 200 }, data: { label: '🚦 Source' }, style: { ...nodeStyle, background: '#2563eb' } },
    { id: 'B', position: { x: 300, y: 50 }, data: { label: 'B' }, style: nodeStyle },
    { id: 'C', position: { x: 300, y: 200 }, data: { label: 'C' }, style: nodeStyle },
    { id: 'D', position: { x: 300, y: 350 }, data: { label: 'D' }, style: nodeStyle },
    { id: 'E', position: { x: 500, y: 100 }, data: { label: 'E' }, style: nodeStyle },
    { id: 'F', position: { x: 500, y: 300 }, data: { label: 'F' }, style: nodeStyle },
    { id: 'G', position: { x: 700, y: 100 }, data: { label: 'G' }, style: nodeStyle },
    { id: 'H', position: { x: 700, y: 300 }, data: { label: 'H' }, style: nodeStyle },
    { id: 'T', position: { x: 900, y: 200 }, data: { label: '🏁 Sink' }, style: { ...nodeStyle, background: '#dc2626' } },
];

// ============================================
// MAIN APP
// ============================================
export default function App() {
    const [nodes, , onNodesChange] = useNodesState(nodesInit);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [guess, setGuess] = useState('');
    const [answer, setAnswer] = useState(null);

    const generateGraph = () => {
        const g = {};
        nodesInit.forEach(n => g[n.id] = {});

        const edges = [
            ['A','B'],['A','C'],['A','D'],
            ['B','E'],['B','F'],
            ['C','E'],['C','F'],
            ['D','F'],
            ['E','G'],['E','H'],
            ['F','H'],
            ['G','T'],['H','T']
        ];

        edges.forEach(([u,v]) => {
            g[u][v] = Math.floor(Math.random()*11)+5;
        });

        return g;
    };

    const updateEdges = (g) => {
        const e = [];

        for (const u in g) {
            for (const v in g[u]) {
                e.push({
                    id: `${u}-${v}`,
                    source: u,
                    target: v,
                    label: `${g[u][v]}`,
                    style: { stroke: '#60a5fa', strokeWidth: 3 },
                    labelStyle: { fill: '#fff', fontWeight: 'bold' },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#60a5fa'
                    }
                });
            }
        }

        setEdges(e);
    };

    const startGame = () => {
        const g = generateGraph();
        updateEdges(g);

        const ek = edmondsKarp(g, 'A', 'T');
        const dinic = dinicsAlgorithm(g, 'A', 'T');

        setAnswer(Math.max(ek.maxFlow, dinic.maxFlow));
        setGuess('');
    };

    const submit = () => {
        if (parseInt(guess) === answer) {
            alert("🎉 Correct!");
        } else {
            alert(`❌ Answer: ${answer}`);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            background: 'linear-gradient(135deg, #0f172a, #020617)',
            color: 'white'
        }}>

            {/* GRAPH */}
            <div style={{ width: '70%' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    fitView
                >
                    <Background color="#1e293b" />
                    <Controls />
                    <MiniMap />
                </ReactFlow>
            </div>

            {/* PANEL */}
            <div style={{
                width: '30%',
                padding: 30,
                backdropFilter: 'blur(10px)',
                background: 'rgba(30,41,59,0.6)',
                borderLeft: '1px solid #334155'
            }}>
                <h1 style={{ fontSize: 24, marginBottom: 10 }}>
                    🚦 Traffic Flow Game
                </h1>

                <button
                    onClick={startGame}
                    style={{
                        padding: '12px 20px',
                        background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                        border: 'none',
                        borderRadius: 10,
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Start Game
                </button>

                <div style={{ marginTop: 20 }}>
                    <input
                        type="number"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter max flow"
                        style={{
                            width: '100%',
                            padding: 12,
                            borderRadius: 10,
                            border: '1px solid #475569',
                            background: '#020617',
                            color: 'white'
                        }}
                    />

                    <button
                        onClick={submit}
                        style={{
                            marginTop: 10,
                            width: '100%',
                            padding: 12,
                            borderRadius: 10,
                            background: '#22c55e',
                            border: 'none',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}