
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CouncilDataProvider } from "../CouncilDataProvider";
import type { FactionWarSummary } from "../Models";


const WarsPage: React.FC = () => {
  const [wars, setWars] = useState<FactionWarSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError(null);
    new CouncilDataProvider().fetchWarsList()
      .then((warsList) => {
        // Sort by warEndTs descending
        const sortedWars = warsList.slice().sort((a, b) => b.warEndTs - a.warEndTs);
        setWars(sortedWars);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to fetch wars list");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="mb-4">Wars</h2>

      {loading && (
        <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
          <Card.Body className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading wars list...</p>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" className="shadow-lg border-danger border-2 rounded-4">
          <Alert.Heading className="d-flex align-items-center">
            <span className="bi bi-exclamation-triangle me-2"></span>
            Wars List Not Found
          </Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {!loading && !error && (
        <Table borderless hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Enemy Faction</th>
              <th>War Start</th>
              <th>War End</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {wars.map((war, idx) => (
              <tr key={war.rankedWarId}>
                <td>{idx + 1}</td>
                <td>{war.enemyFactionName}</td>
                <td>{new Date(war.warStartTs * 1000).toLocaleString()}</td>
                <td>{new Date(war.warEndTs * 1000).toLocaleString()}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/council/war/${war.rankedWarId}`, { state: { war } })}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default WarsPage;
