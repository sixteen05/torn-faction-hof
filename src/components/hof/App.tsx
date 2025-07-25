import { useEffect, useState } from 'react';
import '../../styles/App.css';
import type { PlayerStat } from './HallOfFameBoard';
import { HallOfFameBoard } from './HallOfFameBoard';
import { MetricChart } from './MetricChart';

// Generate 10 players
const playerNames = [
  'PlayerOne', 'PlayerTwo', 'PlayerThree', 'PlayerFour', 'PlayerFive',
  'PlayerSix', 'PlayerSeven', 'PlayerEight', 'PlayerNine', 'PlayerTen'
];

// Generate 20 days of stats
const today = new Date('2025-05-24');
const sampleData = Array.from({ length: 20 }, (_, i) => {
  const date = new Date(today);
  date.setDate(today.getDate() - i);
  return {
    date: date.toISOString().slice(0, 10),
    stats: playerNames.map((name, idx) => ({
      name,
      crimes: Math.floor(20 + Math.random() * 40 + i + idx),
      beers: Math.floor(3 + Math.random() * 10 + (i % 3)),
      bloodBags: Math.floor(Math.random() * 7),
      jailed: Math.floor(20 + Math.random() * 150 + idx * 2),
      networth: Math.floor(5000 + Math.random() * 70000 + i * 1000 + idx * 500),
    })),
  };
}).reverse(); // oldest to newest

const METRICS = [
  { key: 'organizedcrimes', label: 'Organized Crimes', icon: '🔫' },
  { key: 'alcoholused', label: 'Alcohol Used', icon: '🍺' },
  { key: 'bloodwithdrawn', label: 'Blood Withdrawn', icon: '🩸' },
  { key: 'jailed', label: 'Jailed', icon: '🚔' },
  { key: 'networth', label: 'Total Networth', icon: '💰' },
];

function AggregatedStatsBar({ stats }: { stats: PlayerStat[] }) {
  const metrics = [
    { key: 'organizedcrimes', label: 'Organized Crimes', icon: '🔫' },
    { key: 'alcoholused', label: 'Alcohol Used', icon: '🍺' },
    { key: 'bloodwithdrawn', label: 'Blood Withdrawn', icon: '🩸' },
    { key: 'jailed', label: 'Jailed', icon: '🚔' },
    { key: 'networth', label: 'Total Networth', icon: '💰' },
  ];
  const totals = metrics.map(m => ({
    ...m,
    total: stats.reduce((sum, p) => sum + (typeof p[m.key] === 'number' ? (p[m.key] as number) : 0), 0)
  }));
  return (
    <div className="aggregated-bar">
      {totals.map(m => (
        <div className="agg-item" key={m.key}>
          <span className="agg-icon">{m.icon}</span>
          <span className="agg-label">{m.label}</span>
          <span className="agg-value">{m.total.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function getGrowthStats(startStats: PlayerStat[], endStats: PlayerStat[]): PlayerStat[] {
  // Map by player name for quick lookup
  const startMap = Object.fromEntries(startStats.map(p => [p.name, p]));
  return endStats.map(player => {
    const start = startMap[player.name] || {};
    // Calculate growth for each metric
    const growth: PlayerStat = { name: player.name };
    for (const key of Object.keys(player)) {
      if (key !== 'name' && typeof player[key] === 'number') {
        const startVal = typeof start[key] === 'number' ? (start[key] as number) : 0;
        growth[key] = (player[key] as number) - startVal;
      }
    }
    return growth;
  });
}

function App() {
  const [latestStats, setLatestStats] = useState<PlayerStat[]>([]);
  const [allDays, setAllDays] = useState<any[]>([]);
  const [startStats, setStartStats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    fetch('faction-member-hof-dump.json')
      .then(res => res.json())
      .then(data => {
        setAllDays(data);
        if (data && data.length > 0) {
          setStartStats(data[0].stats || []);
          setLatestStats(data[data.length - 1].stats || []);
        }
      })
      .catch(() => {
        setAllDays(sampleData);
        setStartStats(sampleData[0].stats);
        setLatestStats(sampleData[sampleData.length - 1].stats);
      });
  }, []);

  const growthStats = getGrowthStats(startStats, latestStats);

  return (
    <div className="dashboard crime-theme">
      <header className="dashboard-header">
        <h1>🕵️ Torn Hall of Fame 🏆</h1>
        <div className="dashboard-subtitle">Church of night</div>
      </header>
      <AggregatedStatsBar stats={growthStats} />
      <div className="metrics-container">
        {METRICS.map((metric) => {
          // Sort and get top 5 for Hall of Fame based on growth
          const sorted = [...growthStats].sort((a, b) => (b[metric.key] as number) - (a[metric.key] as number));
          const top5 = sorted.slice(0, 5);
          return (
            <div className="metric-section" key={metric.key}>
              <HallOfFameBoard
                metric={metric.key}
                stats={top5}
                icon={metric.icon}
                label={metric.label}
              />
              <MetricChart
                metric={metric.key}
                allDays={allDays.slice(-7)}
                topPlayers={top5.map(p => p.name)}
              />
            </div>
          );
        })}
      </div>
      <footer>
        <span>
          Made for Torn | Crime, Hospital, Jail, Weapons, Money, Trading, Smuggling
        </span>
        <br />
        <span className="tct-date">
          as of {allDays.length > 0 ? allDays[allDays.length - 1].date : ''} TCT
        </span>
      </footer>
    </div>
  );
}

export default App;
