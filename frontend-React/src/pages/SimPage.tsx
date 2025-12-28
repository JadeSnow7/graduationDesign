import { useState } from 'react';
import { useSimulation } from '@/domains/simulation/useSimulation';
import { Atom, Play, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const simTypes = [
    { id: 'laplace', label: 'Laplace 2D', description: '二维拉普拉斯方程数值解' },
    { id: 'charges', label: '点电荷场', description: '点电荷系统电场分布' },
    { id: 'wire', label: '载流导线', description: '载流导线周围磁场' },
];

export function SimPage() {
    const { status, result, error, runLaplace2D, runPointCharges, runWireField, reset } =
        useSimulation();
    const [selectedType, setSelectedType] = useState('laplace');

    const handleRun = () => {
        reset();
        const params = { boundary: 'dirichlet', grid: [100, 100] as [number, number] };
        switch (selectedType) {
            case 'laplace':
                runLaplace2D(params);
                break;
            case 'charges':
                runPointCharges(params);
                break;
            case 'wire':
                runWireField(params);
                break;
        }
    };

    const isRunning = status === 'running';

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Atom className="w-6 h-6 text-purple-400" />
                    电磁场仿真
                </h1>
                <p className="text-sm text-gray-400 mt-1">选择仿真类型并运行数值计算</p>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-700/50 p-6 space-y-6 bg-gray-900/30">
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-3">仿真类型</h3>
                        <div className="space-y-2">
                            {simTypes.map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={clsx(
                                        'w-full text-left px-4 py-3 rounded-xl border transition-all',
                                        selectedType === type.id
                                            ? 'bg-purple-600/20 border-purple-500/50 text-white'
                                            : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                    )}
                                >
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isRunning ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                运行中...
                            </>
                        ) : (
                            <>
                                <Play className="w-5 h-5" />
                                运行仿真
                            </>
                        )}
                    </button>
                </div>

                {/* Result area */}
                <div className="flex-1 p-6 flex items-center justify-center">
                    {status === 'idle' && (
                        <div className="text-center text-gray-500">
                            <Atom className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>选择仿真类型并点击运行</p>
                        </div>
                    )}

                    {isRunning && (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                            <p className="text-gray-400">正在计算...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-400">
                            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                            <p>{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                            <img
                                src={`data:image/png;base64,${result.png_base64}`}
                                alt="Simulation result"
                                className="max-w-full max-h-[60vh] rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
