import type { ReactElement } from "react";
import React from "react";
import { OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { getCalculations, getPay, isNonWarIncomingEnabled, isWarIncomingEnabled } from "./CouncilUtil";
import type { WarMemberAggregate, WarPayFormValues } from "./Models";

interface WarDetailsTableProps {
  warAggregates: WarMemberAggregate[];
  formValues: WarPayFormValues;
}

const wrapWithTooltip = (
  content: ReactElement,
  tooltip: React.ReactNode,
) => (
  <OverlayTrigger
    placement={"top"}
    trigger={["hover", "focus"]}
    overlay={
      <Tooltip className="position-fixed">
        {tooltip}
      </Tooltip>
    }
  >
    {content}
  </OverlayTrigger>
);

const WarDetailsTable: React.FC<WarDetailsTableProps> = ({
  warAggregates,
  formValues
}) => (
  <Table borderless hover responsive className="shadow-sm rounded-4 border-secondary border-2 overflow-hidden m-0">
    <thead className="table-active">
      <tr>
        <th>Member</th>
        <th colSpan={2}>Hits Made</th>
        {(isWarIncomingEnabled(formValues) || isNonWarIncomingEnabled(formValues)) && (
          <th {...(isWarIncomingEnabled(formValues) && isNonWarIncomingEnabled(formValues) && { colSpan: 2 })}>
            Incoming Hits
          </th>
        )}
        <th>Compliant</th>
        <th>Pay</th>
      </tr>
      <tr>
        <th></th>
        <th>
          {wrapWithTooltip(<span>War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}
        </th>
        <th>
          {wrapWithTooltip(<span>Non-War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}
        </th>
        {isWarIncomingEnabled(formValues) && (
          <th>
            {wrapWithTooltip(<span>War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}
          </th>
        )}
        {isNonWarIncomingEnabled(formValues) && (
          <th>
            {wrapWithTooltip(<span>Non-War</span>, "Only hits that result in hospitalization")}
          </th>
        )}
        <th></th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {warAggregates.map(m => {
        const { pay, payCalcString } = getPay(m, formValues);
        const { compliant, compliantCalcString } = getCalculations(m);
        return (
          <tr key={m.id}>
            <td>{m.name}</td>
            <td>{m.warHits}</td>
            <td>{m.nonWarHits}</td>
            {isWarIncomingEnabled(formValues) && <td>{m.incomingWarHits}</td>}
            {isNonWarIncomingEnabled(formValues) && <td>{m.incomingNonWarHits}</td>}
            <td>
              {wrapWithTooltip(<span>{compliant ? "✔️" : "❌"}</span>, compliantCalcString)}
            </td>
            <td>
              {wrapWithTooltip(<span>{pay.toLocaleString()}</span>, payCalcString)}
            </td>
          </tr>
        );
      })}
    </tbody>
    <tfoot className="table-active">
      <tr className="fw-bold">
        <td>Total</td>
        <td>{warAggregates.reduce((sum, m) => sum + m.warHits, 0)}</td>
        <td>{warAggregates.reduce((sum, m) => sum + m.nonWarHits, 0)}</td>
        {isWarIncomingEnabled(formValues) && <td>{warAggregates.reduce((sum, m) => sum + m.incomingWarHits, 0)}</td>}
        {isNonWarIncomingEnabled(formValues) && <td>{warAggregates.reduce((sum, m) => sum + m.incomingNonWarHits, 0)}</td>}
        <td></td>
        <td>{warAggregates.reduce((sum, m) => sum + getPay(m, formValues).pay, 0).toLocaleString()}</td>
      </tr>
    </tfoot>
  </Table>
);

export default WarDetailsTable;
