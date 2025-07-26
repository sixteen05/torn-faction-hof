import React, { useState } from "react";
import { Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DEFAULT_NON_WAR_PAY, DEFAULT_WAR_PAY, getPay } from "./CouncilUtil";
import type { WarMemberAggregate, WarPayFormValues } from "./Models";
import WarDetailsTable from "./WarDetailsTable";
import WarPayForm from "./WarPayForm";

const sampleWarAggregateData: WarMemberAggregate[] = [
  { id: 1, name: "Alice", warHits: 12, nonWarHits: 5, incomingWarHits: 2, incomingNonWarHits: 1, xanaxUsed: 3, pointsUsed: 30 },
  { id: 2, name: "Bob", warHits: 8, nonWarHits: 7, incomingWarHits: 1, incomingNonWarHits: 1, xanaxUsed: 3, pointsUsed: 0 },
  { id: 3, name: "Charlie", warHits: 15, nonWarHits: 2, incomingWarHits: 1, incomingNonWarHits: 0, xanaxUsed: 1, pointsUsed: 0 },
];

const WarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [formValues, setFormValues] = useState<WarPayFormValues>({
    warPay: DEFAULT_WAR_PAY,
    nonWarPay: DEFAULT_NON_WAR_PAY,
    warIncomingDeduction: 0,
    nonWarIncomingDeduction: 0,
    showAdvanced: false,
  });

  return (
    <div>
      <h2 className="mb-4">War Details (ID: {id})</h2>
      <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
        <Card.Body>
          <WarPayForm
            initialValues={formValues}
            onChange={setFormValues}
            estimatedPay={sampleWarAggregateData.reduce((sum, m) => sum + getPay(m, formValues).pay, 0)}
          />
        </Card.Body>
      </Card>
      <Card className="mb-4 shadow-lg border-secondary border-2 rounded-4">
        <Card.Body className="p-0">
          <WarDetailsTable
            warAggregates={sampleWarAggregateData}
            formValues={formValues}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default WarDetailsPage;
