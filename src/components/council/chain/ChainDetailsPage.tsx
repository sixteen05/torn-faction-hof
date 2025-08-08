import React, { useEffect, useState } from "react";
import { Alert, Card } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import { CouncilDataProvider } from "../CouncilDataProvider";
import { DEFAULT_COUNT_ALL_TYPES, DEFAULT_PAY_ABOVE, DEFAULT_PAY_BELOW, DEFAULT_RESPECT_THRESHOLD } from "../CouncilUtil";
import type { ChainMemberAggregate, ChainPayFormValues } from "../Models";
import ChainDetailsTable from "./ChainDetailsTable";
import ChainPayForm from "./ChainPayForm";

const ChainDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const chainDetails = (location.state && (location.state as any).chain) || null;
  const [formValues, setFormValues] = useState<ChainPayFormValues>({
    respectThreshold: DEFAULT_RESPECT_THRESHOLD,
    payBelowThreshold: DEFAULT_PAY_BELOW,
    payAboveThreshold: DEFAULT_PAY_ABOVE,
    showAdvanced: false,
    countAllTypes: DEFAULT_COUNT_ALL_TYPES,
  });
  const [memberAggregates, setMemberAggregates] = useState<ChainMemberAggregate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setError('');

    let reportPromise: Promise<ChainMemberAggregate[]>;
    if (chainDetails?.chainReportFile) {
      reportPromise = new CouncilDataProvider().fetchChainDetails(chainDetails.chainReportFile);
    } else {
      reportPromise = new CouncilDataProvider().fetchChainDetailsFromId(id || '');
    }

    reportPromise
      .then((members) => {
        setMemberAggregates(members);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to fetch chain details");
      })
      .finally(() => setLoading(false));
  }, [chainDetails]);

  const getPay = (member: ChainMemberAggregate, values: ChainPayFormValues) => {
    const { respectThreshold, payBelowThreshold, payAboveThreshold, countAllTypes } = values;
    let attackCount = 0;
    if (countAllTypes) {
      attackCount = Object.values(member.attackBreakdown).reduce((a, b) => a + b, 0);
    } else {
      attackCount = member.attackBreakdown["Attacked"] ?? 0;
    }

    const pay = (member.respect < respectThreshold ? payBelowThreshold : payAboveThreshold) * attackCount;
    return { pay, attackCount };
  };

  return (
    <div>
      <h2 className="mb-4">Chain Details (ID: {chainDetails?.id || id})</h2>
      {loading && (
        <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
          <Card.Body className="text-center">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading chain report...</p>
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger" className="shadow-lg border-danger border-2 rounded-4">
          <Alert.Heading className="d-flex align-items-center">
            <span className="bi bi-exclamation-triangle me-2"></span>
            Chain Report Not Found
          </Alert.Heading>
          <p className="mb-0">{error}</p>
          <hr />
          <p className="mb-0 text-muted">
            Contact <a href="https://www.torn.com/profile.php?XID=3538936" target="_blank" rel="noopener noreferrer" className="text-info">red-it</a> to make sure the chain report file exists at <code>/public/chain-report-{id}.json</code>
          </p>
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
            <Card.Body>
              <ChainPayForm
                initialValues={formValues}
                onChange={setFormValues}
                estimatedPay={memberAggregates.reduce((sum, m) => sum + getPay(m, formValues).pay, 0)}
              />
            </Card.Body>
          </Card>
          <Card className="mb-4 shadow-lg border-secondary border-2 rounded-4">
            <Card.Body className="p-0">
              <ChainDetailsTable
                memberAggregates={memberAggregates}
                formValues={formValues}
                getPay={getPay}
              />
            </Card.Body>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChainDetailsPage;
