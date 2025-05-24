import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';
import type { PlayerStat } from './HallOfFameBoard';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

export interface MetricChartProps {
    metric: string;
    allDays: { date: string; stats: PlayerStat[] }[];
    topPlayers: string[];
}

const playerColors = [
    '#ffd700', // gold
    '#c0c0c0', // silver
    '#cd7f32', // bronze
    '#00bfff', // blue
    '#ff69b4', // pink
    '#00ff7f', // green
    '#ff4500', // orange
    '#8a2be2', // purple
    '#ff1493', // magenta
    '#20b2aa', // teal
];

export const MetricChart: React.FC<MetricChartProps> = ({ metric, allDays, topPlayers }) => {
    const labels = allDays.map(day => day.date);
    const datasets = topPlayers.map((player, idx) => ({
        label: player,
        data: allDays.map(day => {
            const stat = day.stats.find(s => s.name === player);
            return stat ? (stat[metric] as number) : 0;
        }),
        borderColor: playerColors[idx % playerColors.length],
        backgroundColor: playerColors[idx % playerColors.length],
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        borderWidth: 3,
    }));
    const data = { labels, datasets };
    return (
        <div className="metric-chart">
            <Line data={data} options={{
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: '#fff',
                        }
                    }
                },
                scales: {
                    x: {
                        // Format X axis labels as dd/MM
                        ticks: {
                            color: '#fff',
                            callback: function (value, index, ticks) {
                                // value is the label (date string)
                                const label = this.getLabelForValue(value as number);
                                if (!label) return '';
                                const [year, month, day] = label.split('-');
                                return `${day}/${month}`;
                            }
                        },
                    },
                    y: {
                        display: false, // Hide Y axis values
                        grid: {
                            display: false,
                        },
                    },
                },
                responsive: true,
                maintainAspectRatio: false,
            }} height={220} />
        </div>
    );
};
