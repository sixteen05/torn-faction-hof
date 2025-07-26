import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { DEFAULT_NON_WAR_PAY, DEFAULT_WAR_PAY, getPay } from "./CouncilUtil";
import type { WarMemberAggregate, WarPayFormValues } from "./Models";
import WarDetailsTable from "./WarDetailsTable";
import WarPayForm from "./WarPayForm";


// Data provider to fetch war details from attacks.json
async function fetchWarDetails(warId: string | number): Promise<WarMemberAggregate[]> {
  // For now, always use attacks.json for warId 1
  const response = await fetch('/src/assets/attacks.json');
  const data = await response.json();
  return Object.entries(data).map(([name, stats], idx) => {
    const s = stats as {
      attacks: { war: Record<string, number>; 'non-war': Record<string, number> };
      defends: { war: Record<string, number>; 'non-war': Record<string, number> };
    };
    const warHits = Object.values(s.attacks?.war ?? {}).reduce((a: number, b: number) => a + b, 0);
    const nonWarHits = Object.values(s.attacks?.['non-war'] ?? {}).reduce((a: number, b: number) => a + b, 0);
    const incomingWarHits = Object.values(s.defends?.war ?? {}).reduce((a: number, b: number) => a + b, 0);
    const incomingNonWarHits = Object.values(s.defends?.['non-war'] ?? {}).reduce((a: number, b: number) => a + b, 0);
    return {
      id: idx + 1,
      name,
      warHits,
      nonWarHits,
      incomingWarHits,
      incomingNonWarHits,
      xanaxUsed: 0,
      pointsUsed: 0,
    } as WarMemberAggregate;
  });
}


const WarDetailsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [formValues, setFormValues] = useState<WarPayFormValues>({
    warPay: DEFAULT_WAR_PAY,
    nonWarPay: DEFAULT_NON_WAR_PAY,
    warIncomingDeduction: 0,
    nonWarIncomingDeduction: 0,
    showAdvanced: false,
  });
  const [warAggregates, setWarAggregates] = useState<WarMemberAggregate[]>([]);

  useEffect(() => {
    // For now, always fetch war id 1 from attacks.json
    fetchWarDetails(id ?? 1).then(setWarAggregates);
  }, [id]);

  return (
    <div>
      <h2 className="mb-4">War Details (ID: {id})</h2>
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
    </div>
  );
};

export default WarDetailsPage;
