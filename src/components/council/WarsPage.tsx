import React from "react";
import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

// Dummy data for demonstration
const wars = [
  { id: 1, winner: true, myFactionScore: 150, enemyFactionScore: 120, opponent: "Faction X", datetime: "2025-07-10 14:00" },
  { id: 2, winner: false, myFactionScore: 90, enemyFactionScore: 200, opponent: "Faction Y", datetime: "2025-07-15 19:45" },
];

const WarsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Wars</h2>
      <Table borderless hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Result</th>
            <th>My Faction</th>
            <th>Enemy Faction</th>
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
              <td>{war.myFactionScore}</td>
              <td>{war.enemyFactionScore}</td>
              <td>{war.opponent}</td>
              <td>{war.datetime}</td>
              <td>
                <Button variant="primary" size="sm" onClick={() => navigate(`view/${war.id}`)}>
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default WarsPage;
