import React, { useCallback, useState } from "react";
import { Button, Card, Form, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { useParams } from "react-router-dom";

// Dummy data for demonstration
const members = [
  { id: 1, name: "Alice", warHits: 12, nonWarHits: 5, incomingWarHits: 2, incomingNonWarHits: 1, xanaxUsed: 3, pointsUsed: 30 },
  { id: 2, name: "Bob", warHits: 8, nonWarHits: 7, incomingWarHits: 1, incomingNonWarHits: 1, xanaxUsed: 3, pointsUsed: 0 },
  { id: 3, name: "Charlie", warHits: 15, nonWarHits: 2, incomingWarHits: 1, incomingNonWarHits: 0, xanaxUsed: 1, pointsUsed: 0 },
];

const XANAX_HITS_PER_HIT = 10;
const POINTS_HITS_PER_HIT = 1 / 5;
const DEFAULT_WAR_PAY = 300000;
const DEFAULT_NON_WAR_PAY = 100000;
const DEFAULT_NON_WAR_INCOMING_DEDUCTION = 10000;
const DEFAULT_WAR_INCOMING_DEDUCTION = 10000;

const WarDetailsPage: React.FC = () => {
  const { id } = useParams();
  const [warPay, setWarPay] = useState(DEFAULT_WAR_PAY);
  const [nonWarPay, setNonWarPay] = useState(DEFAULT_NON_WAR_PAY);
  const [nonWarIncomingDeduction, setNonWarIncomingDeduction] = useState(DEFAULT_NON_WAR_INCOMING_DEDUCTION);
  const [warIncomingDeduction, setWarIncomingDeduction] = useState(DEFAULT_WAR_INCOMING_DEDUCTION);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isNonWarIncomingEnabled = () => !!nonWarIncomingDeduction && nonWarIncomingDeduction > 0;
  const isWarIncomingEnabled = () => !!warIncomingDeduction && warIncomingDeduction > 0;

  const getCalculations = (m: typeof members[0]) => {
    const expectedHits = m.xanaxUsed * XANAX_HITS_PER_HIT + m.pointsUsed * POINTS_HITS_PER_HIT;
    const hitsMade = m.warHits + m.nonWarHits;
    const compliant = hitsMade >= expectedHits;
    const calc = `Xanax: ${m.xanaxUsed} × ${XANAX_HITS_PER_HIT} + Points: ${m.pointsUsed} × ${POINTS_HITS_PER_HIT} = ${expectedHits} expected, Made: ${hitsMade}`;
    return { compliant, calc };
  }

  const toggleAdvanced = useCallback(() => {
    if (showAdvanced) {
      setShowAdvanced(false);
      setTimeout(() => {
        setWarIncomingDeduction(0);
        setNonWarIncomingDeduction(0);
      }, 600);
    } else {
      setShowAdvanced(true);
      setWarIncomingDeduction(DEFAULT_WAR_INCOMING_DEDUCTION);
      setNonWarIncomingDeduction(DEFAULT_NON_WAR_INCOMING_DEDUCTION);
    }
  }, [showAdvanced]);

  const getPay = (m: typeof members[0]) => {
    let pay = m.warHits * warPay + m.nonWarHits * nonWarPay;
    let calc = `${m.warHits}×${warPay.toLocaleString()} + ${m.nonWarHits}×${nonWarPay.toLocaleString()}`;
    if (isWarIncomingEnabled()) {
      pay -= m.incomingWarHits * warIncomingDeduction;
      calc += ` - ${m.incomingWarHits}×${warIncomingDeduction.toLocaleString()}`;
    }

    if (isNonWarIncomingEnabled()) {
      pay -= m.incomingNonWarHits * nonWarIncomingDeduction;
      calc += ` - ${m.incomingNonWarHits}×${nonWarIncomingDeduction.toLocaleString()}`;
    }

    return { pay, calc };
  };

  return (
    <div>
      <h2 className="mb-4">War Details (ID: {id})</h2>
      <Card className="mb-4 bg-dark text-light shadow-lg border-secondary border-2 rounded-4">
        <Card.Body>
          <Form className="mb-3">
            <div className="d-flex gap-3 align-items-end flex-wrap justify-content-between">
              <div className="d-flex gap-3 align-items-end flex-wrap">
                <Form.Group>
                  <Form.Label>Pay per War Hit</Form.Label>
                  <Form.Control type="number" value={warPay} onChange={e => setWarPay(Number(e.target.value))} min={0} />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Pay per Non-War Hit</Form.Label>
                  <Form.Control type="number" value={nonWarPay} onChange={e => setNonWarPay(Number(e.target.value))} min={0} />
                </Form.Group>
                <Button
                  variant="secondary"
                  onClick={toggleAdvanced}
                  data-bs-toggle="collapse"
                  data-bs-target="#advanced-collapse"
                  aria-controls="advanced-collapse"
                  aria-expanded={showAdvanced}
                  className="align-items-center"
                >
                  <span
                    className={`bi ${showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                    aria-hidden="true"
                  />
                  <span className="visually-hidden">Toggle Advanced Options</span>
                </Button>
              </div>
              <div className="ms-auto text-end">
                <div className="fs-4 fw-bold text-success-emphasis">
                  Estimated Pay: {members.reduce((sum, m) => sum + getPay(m).pay, 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div
              id="advanced-collapse"
              style={{
                maxHeight: showAdvanced ? '500px' : '0',
                opacity: showAdvanced ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.6s cubic-bezier(.4,2,.3,1), opacity 0.4s ease'
              }}
            >
              <div className="mt-5">
                <Form.Group className="mb-3">
                  <Form.Label>War Incoming Hits Deduction (apply to any hits that result in Leave, Hospitalization or Mug)</Form.Label>
                  <Form.Control
                    type="number"
                    value={warIncomingDeduction}
                    onChange={e => setWarIncomingDeduction(Number(e.target.value))}
                    min={0}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Non-War Incoming Deduction (only apply to Hospitalizations)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nonWarIncomingDeduction}
                    onChange={e => setNonWarIncomingDeduction(Number(e.target.value))}
                    min={0}
                  />
                </Form.Group>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <Card className="mb-4 shadow-lg border-secondary border-2 rounded-4">
        <Card.Body className="p-0">
          <Table borderless hover responsive className="shadow-sm rounded-4 border-secondary border-2 overflow-hidden m-0">
            <thead className="table-active">
              <tr>
                <th>Member</th>
                <th colSpan={2}>Hits Made</th>
                {(isWarIncomingEnabled() || isNonWarIncomingEnabled()) && (
                  <th {...(isWarIncomingEnabled() && isNonWarIncomingEnabled() && { colSpan: 2 })}>
                    Incoming Hits
                  </th>
                )}
                <th>Compliant</th>
                <th>Pay</th>
              </tr>
              <tr>
                <th />
                <th>War</th>
                <th>Non-War</th>
                {isWarIncomingEnabled() && <th>War</th>}
                {isNonWarIncomingEnabled() && <th>Non-War</th>}
                <th />
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const { pay, calc } = getPay(m);
                const { compliant, calc: compCalc } = getCalculations(m);
                return (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.warHits}</td>
                    <td>{m.nonWarHits}</td>
                    {isWarIncomingEnabled() && <td>{m.incomingWarHits}</td>}
                    {isNonWarIncomingEnabled() && <td>{m.incomingNonWarHits}</td>}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        trigger={['hover', 'focus']}
                        overlay={<Tooltip id={`tooltip-comply-${m.id}`}>{compCalc}</Tooltip>}
                      >
                        <span>{compliant ? '✔️' : '❌'}</span>
                      </OverlayTrigger>
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        defaultShow={false}
                        delay={{ show: 250, hide: 400 }}
                        overlay={<Tooltip id={`tooltip-pay-${m.id}`}>{calc}</Tooltip>}
                      >
                        <span>{pay.toLocaleString()}</span>
                      </OverlayTrigger>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="table-active">
              <tr className="fw-bold">
                <td>Total</td>
                <td>{members.reduce((sum, m) => sum + m.warHits, 0)}</td>
                <td>{members.reduce((sum, m) => sum + m.nonWarHits, 0)}</td>
                {isWarIncomingEnabled() && <td>{members.reduce((sum, m) => sum + m.incomingWarHits, 0)}</td>}
                {isNonWarIncomingEnabled() && <td>{members.reduce((sum, m) => sum + m.incomingNonWarHits, 0)}</td>}
                <td></td>
                <td>{members.reduce((sum, m) => sum + getPay(m).pay, 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default WarDetailsPage;
