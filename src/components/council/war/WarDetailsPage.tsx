import React, { useEffect, useState } from "react";
import { Alert, Card } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import { CouncilDataProvider } from "../CouncilDataProvider";
import { DEFAULT_NON_WAR_PAY, DEFAULT_WAR_PAY, getPay } from "../CouncilUtil";
import type { WarMemberAggregate, WarPayFormValues } from "../Models";
import WarDetailsTable from "./WarDetailsTable";
import WarPayForm from "./WarPayForm";

const WarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const warDetails = (location.state && (location.state as any).war) || null;
  const [formValues, setFormValues] = useState<WarPayFormValues>({
    warPay: DEFAULT_WAR_PAY,
    nonWarPay: DEFAULT_NON_WAR_PAY,
    warIncomingDeduction: 0,
    nonWarIncomingDeduction: 0,
    showAdvanced: false,
  });
  const [warAggregates, setWarAggregates] = useState<WarMemberAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!warDetails || !warDetails.warReportFile) {
      setError("No war details or report file provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    new CouncilDataProvider().fetchWarDetails(warDetails.warReportFile)
      .then((data) => setWarAggregates(data))
      .catch(err => {
        setError(err instanceof Error ? err.message : "Failed to fetch war details");
      })
      .finally(() => setLoading(false));

  }, [warDetails]);

  return (
    <div>
      <h2 className="mb-4">War Details (ID: {warDetails?.rankedWarId || id})</h2>

      {loading && (
        <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
          <Card.Body className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading war report...</p>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" className="shadow-lg border-danger border-2 rounded-4">
          <Alert.Heading className="d-flex align-items-center">
            <span className="bi bi-exclamation-triangle me-2"></span>
            War Report Not Found
          </Alert.Heading>
          <p className="mb-0">{error}</p>
          <hr />
          <p className="mb-0 text-muted">
            Contact <a href="https://www.torn.com/profile.php?XID=3538936" target="_blank" rel="noopener noreferrer" className="text-info">red-it</a> to make sure the war report file exists at <code>/public/war-report-{id}.json</code>
          </p>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
            <Card.Body>
              <WarPayForm
                initialValues={formValues}
                onChange={setFormValues}
                estimatedPay={warAggregates.reduce((sum, m) => sum + getPay(m, formValues).pay, 0)}
              />
            </Card.Body>
          </Card>
          <Card className="mb-4 shadow-lg border-secondary border-2 rounded-4">
            <Card.Body className="p-0">
              <WarDetailsTable
                warAggregates={warAggregates}
                formValues={formValues}
              />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default WarDetailsPage;