import React from 'react';

export interface PlayerStat {
    name: string;
    [key: string]: string | number;
}

export interface HallOfFameBoardProps {
    metric: string;
    stats: PlayerStat[];
    icon?: React.ReactNode;
    label: string;
}

const getMedalClass = (rank: number) => {
    if (rank === 0) return 'gold';
    if (rank === 1) return 'silver';
    if (rank === 2) return 'bronze';
    return '';
};

const getMedal = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return '';
};

export const HallOfFameBoard: React.FC<HallOfFameBoardProps> = ({ metric, stats, icon, label }) => {
    const sorted = [...stats].sort((a, b) => (b[metric] as number) - (a[metric] as number));
    const top5 = sorted.slice(0, 5);
    return (
        <div className="hof-board">
            <h2>{icon} {label} HOF</h2>
            <ol>
                {top5.map((player, idx) => (
                    <li key={player.name} className={getMedalClass(idx)}>
                        <span className="medal">{getMedal(idx)}</span>
                        <span className="player-name">{player.name}</span>
                        <span className="stat-value">{player[metric]}</span>
                    </li>
                ))}
            </ol>
        </div>
    );
};
