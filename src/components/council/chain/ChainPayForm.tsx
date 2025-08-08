import React, { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import type { ChainPayFormValues } from "../Models";

interface ChainPayFormProps {
  initialValues: ChainPayFormValues;
  onChange: (values: ChainPayFormValues) => void;
  estimatedPay: number;
}

const ChainPayForm: React.FC<ChainPayFormProps> = ({ initialValues, onChange, estimatedPay }) => {
  const [respectThreshold, setRespectThreshold] = useState<number>(initialValues.respectThreshold);
  const [payBelowThreshold, setPayBelowThreshold] = useState<number>(initialValues.payBelowThreshold);
  const [payAboveThreshold, setPayAboveThreshold] = useState<number>(initialValues.payAboveThreshold);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(initialValues.showAdvanced);
  const [countAllTypes, setCountAllTypes] = useState<boolean>(initialValues.countAllTypes);
  const [flash, setFlash] = useState<boolean>(false);
  const prevPayRef = React.useRef<number>(estimatedPay);

  React.useEffect(() => {
    if (prevPayRef.current !== estimatedPay) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 1200);
      prevPayRef.current = estimatedPay;
      return () => clearTimeout(timeout);
    }
  }, [estimatedPay]);

  useEffect(() => {
    onChange({ respectThreshold, payBelowThreshold, payAboveThreshold, showAdvanced, countAllTypes });
  }, [respectThreshold, payBelowThreshold, payAboveThreshold, showAdvanced, countAllTypes, onChange]);

  const toggleAdvanced = () => {
    setShowAdvanced((prev) => !prev);
  };

  return (
    <Form className="mb-2">
      <div className="d-flex gap-3 align-items-end flex-wrap justify-content-between">
        <div className="d-flex gap-3 align-items-end flex-wrap">
          <Form.Group>
            <Form.Label>Pay (Respect &lt; {respectThreshold})</Form.Label>
            <Form.Control type="number" value={payBelowThreshold} onChange={e => setPayBelowThreshold(Number(e.target.value))} min={0} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Pay (Respect ≥ {respectThreshold})</Form.Label>
            <Form.Control type="number" value={payAboveThreshold} onChange={e => setPayAboveThreshold(Number(e.target.value))} min={0} />
          </Form.Group>
          <Button
            variant="secondary"
            onClick={toggleAdvanced}
            data-bs-toggle="collapse"
            data-bs-target="#chain-advanced-collapse"
            aria-controls="chain-advanced-collapse"
            aria-expanded={showAdvanced}
            className="align-items-center"
          >
            <span className={`bi ${showAdvanced ? 'bi-chevron-up' : 'bi-chevron-down'}`}
              aria-hidden="true"
            />
            <span className="visually-hidden">Toggle Advanced Options</span>
          </Button>
        </div>
        <div className="ms-auto text-end">
          <div className="fw-bold text-success-emphasis user-select-none">
            Estimated Pay:&nbsp;
            <span className={`estimated-pay-flash px-1 user-select-all ${flash ? 'flash' : ''}`}>
              {estimatedPay.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <div
        id="chain-advanced-collapse"
        style={{
          maxHeight: showAdvanced ? '200px' : '0',
          opacity: showAdvanced ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.6s cubic-bezier(.4,2,.3,1), opacity 0.4s ease'
        }}
      >
        <div className="mt-4">
          <Form.Group className="mb-3">
            <Form.Label>Respect Threshold</Form.Label>
            <Form.Control type="number" value={respectThreshold} onChange={e => setRespectThreshold(Number(e.target.value))} min={0} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Count all attack types (not just 'Leave')"
              checked={countAllTypes}
              onChange={e => setCountAllTypes(e.target.checked)}
            />
          </Form.Group>
        </div>
      </div>
    </Form>
  );
};

export default ChainPayForm;
