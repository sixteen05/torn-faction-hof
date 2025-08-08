
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { CouncilDataProvider } from "../CouncilDataProvider";
import { wrapWithTooltip } from "../CouncilUtil";
import type { ChainSummary } from "../Models";

const ChainsPage: React.FC = () => {
  const [chains, setChains] = useState<ChainSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showAll, setShowAll] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    new CouncilDataProvider()
      .fetchChainsList()
      .then((fetchedChains: ChainSummary[]) => {
        fetchedChains.sort((a, b) => b.end - a.end);
        setChains(fetchedChains);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch chains");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="mb-4">Chains</h2>

      {loading && (
        <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
          <Card.Body className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading chains list...</p>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" className="shadow-lg border-danger border-2 rounded-4">
          <Alert.Heading className="d-flex align-items-center">
            <span className="bi bi-exclamation-triangle me-2"></span>
            Chains List Not Found
          </Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {!loading && !error && (
        <Table borderless hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Chain Count &nbsp;
                {wrapWithTooltip(
                  <Button
                    variant={showAll ? "outline-warning" : "warning"}
                    size="sm"
                    className="ms-2"
                    onClick={() => setShowAll((prev) => !prev)}
                    title={showAll ? "Hide small or war chains" : "Show all chains"}
                  >
                    <span className="bi bi-funnel"></span>
                  </Button>,
                  `${showAll ? "Hide small or war chains" : "Show all chains"}`)
                }
              </th>
              <th>Respect</th>
              <th>Start</th>
              <th>End</th>
              <th>View</th>
              <th>Open in Torn</th>
            </tr>
          </thead>
          <tbody>
            {(showAll
              ? chains
              : chains.filter(chain => chain.chain >= 500 && !chain.isWarChain)
            ).map((chain, idx) => (
              <tr key={chain.id}>
                <td>{idx + 1}</td>
                <td>
                  {chain.chain}
                  {chain.isWarChain && <span className="ms-2 badge bg-danger">War</span>}
                </td>
                <td>{chain.respect.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td>{new Date(chain.start * 1000).toLocaleString()}</td>
                <td>{new Date(chain.end * 1000).toLocaleString()}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/council/chain/${chain.id}`, { state: { chain } })}
                  >
                    View
                  </Button>
                </td>
                <td>
                  <a
                    href={`https://www.torn.com/war.php?step=chainreport&chainID=${chain.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-warning btn-sm"
                  >
                    Torn Link
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ChainsPage;
