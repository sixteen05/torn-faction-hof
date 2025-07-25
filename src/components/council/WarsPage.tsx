import React from "react";
import { Button, Table } from "react-bootstrap";

// Dummy data for demonstration
const wars = [
  { id: 1, winner: true, score: "150-120", opponent: "Faction X", datetime: "2025-07-10 14:00" },
  { id: 2, winner: false, score: "90-200", opponent: "Faction Y", datetime: "2025-07-15 19:45" },
];

const WarsPage: React.FC = () => (
  <div>
    <h2>Wars</h2>
    <Table borderless hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Result</th>
          <th>Score</th>
          <th>Opponent</th>
          <th>Date/Time</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        {wars.map((war) => (
          <tr key={war.id}>
            <td>{war.id}</td>
            <td>{war.winner ? <span style={{ color: 'green' }}>&#x2714;</span> : <span style={{ color: 'red' }}>&#x2716;</span>}</td>
            <td>{war.score}</td>
            <td>{war.opponent}</td>
            <td>{war.datetime}</td>
            <td><Button variant="primary" size="sm">View</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

export default WarsPage;
