import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { DEFAULT_NON_WAR_INCOMING_DEDUCTION, DEFAULT_NON_WAR_PAY, DEFAULT_WAR_INCOMING_DEDUCTION, DEFAULT_WAR_PAY } from "./CouncilUtil";
import type { WarPayFormValues } from "./Models";

interface WarPayFormProps {
  initialValues?: Partial<WarPayFormValues>;
  onChange: (values: WarPayFormValues) => void;
  estimatedPay: number;
}

const WarPayForm: React.FC<WarPayFormProps> = ({ initialValues, onChange, estimatedPay }) => {
  const [warPay, setWarPay] = useState(initialValues?.warPay ?? DEFAULT_WAR_PAY);
  const [nonWarPay, setNonWarPay] = useState(initialValues?.nonWarPay ?? DEFAULT_NON_WAR_PAY);
  const [warIncomingDeduction, setWarIncomingDeduction] = useState(initialValues?.warIncomingDeduction ?? DEFAULT_WAR_INCOMING_DEDUCTION);
  const [nonWarIncomingDeduction, setNonWarIncomingDeduction] = useState(initialValues?.nonWarIncomingDeduction ?? DEFAULT_NON_WAR_INCOMING_DEDUCTION);
  const [showAdvanced, setShowAdvanced] = useState(initialValues?.showAdvanced ?? false);

  // Notify parent on any change
  useEffect(() => {
    onChange({ warPay, nonWarPay, warIncomingDeduction, nonWarIncomingDeduction, showAdvanced });
  }, [warPay, nonWarPay, warIncomingDeduction, nonWarIncomingDeduction, showAdvanced, onChange]);

  const toggleAdvanced = () => {
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
  };

  return (
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
            Estimated Pay: {estimatedPay.toLocaleString()}
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
  );
};

export default WarPayForm;
