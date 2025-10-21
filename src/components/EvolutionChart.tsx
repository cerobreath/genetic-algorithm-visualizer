import { Card } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface EvolutionChartProps {
    history: Array<{ generation: number; maxFitness: number; avgFitness: number }>;
}

export function EvolutionChart({ history }: EvolutionChartProps) {
    const data = {
        labels: history.map((h) => h.generation),
        datasets: [
            {
                label: "Максимальна якість",
                data: history.map((h) => h.maxFitness),
                borderColor: "rgb(34, 197, 94)", // Яскраво-зелений
                backgroundColor: "rgba(34, 197, 94, 0.15)",
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: "rgb(34, 197, 94)",
                pointBorderColor: "white",
                pointBorderWidth: 2,
                tension: 0.4,
                fill: false,
            },
            {
                label: "Середня якість",
                data: history.map((h) => h.avgFitness),
                borderColor: "rgb(59, 130, 246)", // Яскраво-синій
                backgroundColor: "rgba(59, 130, 246, 0.15)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: "rgb(59, 130, 246)",
                pointBorderColor: "white",
                pointBorderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: {
                        size: 13,
                    },
                    color: "rgb(15, 23, 42)",
                },
            },
            title: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "white",
                bodyColor: "white",
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                            label += ": ";
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toFixed(4);
                        }
                        return label;
                    },
                    title: function (tooltipItems) {
                        return `Покоління ${tooltipItems[0].label}`;
                    },
                },
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Покоління",
                    color: "rgb(15, 23, 42)",
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: "rgba(203, 213, 225, 0.5)",
                    drawTicks: true,
                },
                ticks: {
                    color: "rgb(71, 85, 105)",
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Якість f(x)",
                    color: "rgb(15, 23, 42)",
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: "rgba(203, 213, 225, 0.5)",
                    drawTicks: true,
                },
                ticks: {
                    color: "rgb(71, 85, 105)",
                    font: {
                        size: 12,
                    },
                    callback: function (value) {
                        return typeof value === "number" ? value.toFixed(2) : value;
                    },
                },
                beginAtZero: false,
            },
        },
    };

    if (history.length === 0) {
        return (
            <Card className="p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Графік еволюції</h2>
                </div>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                        <p>Графік з'явиться після початку еволюції</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Графік еволюції</h2>
            </div>

            <div className="h-[400px]">
                <Line data={data} options={options} />
            </div>
        </Card>
    );
}