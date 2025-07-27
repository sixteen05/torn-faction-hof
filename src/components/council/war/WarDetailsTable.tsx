import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { wrapWithTooltip as addTooltip, getCalculations, getPay, isNonWarIncomingEnabled, isWarIncomingEnabled, formatAttackBreakdown, allTypeSortFunction } from "../CouncilUtil";
import type { ColumnDataTypesList, WarMemberAggregate, WarPayFormValues } from "../Models";

interface WarDetailsTableProps {
  warAggregates: WarMemberAggregate[];
  formValues: WarPayFormValues;
}

const columnDataTypesList: ColumnDataTypesList = {
  alphanumeric: ["name"],
  number: ["warHits", "nonWarHits", "incomingWarHits", "incomingNonWarHits", "pay"],
  boolean: ["compliant"]
}

const WarDetailsTable: React.FC<WarDetailsTableProps> = ({ warAggregates, formValues }) => {
  const [sortCol, setSortCol] = useState<string>("warHits");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Calculate pay and compliant for sorting
  const aggregatesWithCalc = warAggregates.map(m => {
    const { pay } = getPay(m, formValues);
    const { compliant } = getCalculations(m);
    return { ...m, pay, compliant };
  });

  const sortedAggregates = [...aggregatesWithCalc].sort((a, b) => {
    return allTypeSortFunction(a, b, sortCol, sortDir, columnDataTypesList);
  });

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir(columnDataTypesList.alphanumeric.includes(col) ? "asc" : "desc");
    }
  };

  return (
    <Table borderless hover responsive className="shadow-sm rounded-4 border-secondary border-2 overflow-hidden m-0">
      <thead className="table-active user-select-none">
        <tr>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("name")}>Member {sortCol === "name" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th colSpan={2}>Hits Made</th>
          {(isWarIncomingEnabled(formValues) || isNonWarIncomingEnabled(formValues)) && (
            <th {...(isWarIncomingEnabled(formValues) && isNonWarIncomingEnabled(formValues) && { colSpan: 2 })}>
              Incoming Hits
            </th>
          )}
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("compliant")}>Compliant {sortCol === "compliant" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("pay")}>Pay {sortCol === "pay" && (sortDir === "asc" ? "▲" : "▼")}</th>
        </tr>
        <tr>
          <th></th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("warHits")}>{addTooltip(<span>War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}{sortCol === "warHits" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("nonWarHits")}>{addTooltip(<span>Non-War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}{sortCol === "nonWarHits" && (sortDir === "asc" ? "▲" : "▼")}</th>
          {isWarIncomingEnabled(formValues) && (
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("incomingWarHits")}>{addTooltip(<span>War</span>, "Includes all hits resulting in leave, hospitalization, and mugs")}{sortCol === "incomingWarHits" && (sortDir === "asc" ? "▲" : "▼")}</th>
          )}
          {isNonWarIncomingEnabled(formValues) && (
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("incomingNonWarHits")}>{addTooltip(<span>Non-War</span>, "Only hits that result in hospitalization")}{sortCol === "incomingNonWarHits" && (sortDir === "asc" ? "▲" : "▼")}</th>
          )}
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedAggregates.map(m => (
          <tr key={m.id}>
            <td>{m.name}</td>
            <td>
              {addTooltip(<span>{m.warHits}</span>, formatAttackBreakdown(m.warAttackBreakdown))}
            </td>
            <td>
              {addTooltip(<span>{m.nonWarHits}</span>, formatAttackBreakdown(m.nonWarAttackBreakdown))}
            </td>
            {isWarIncomingEnabled(formValues) && <td>{m.incomingWarHits}</td>}
            {isNonWarIncomingEnabled(formValues) && <td>{m.incomingNonWarHits}</td>}
            <td>
              {addTooltip(<span>{m.compliant ? "✔️" : "❌"}</span>, getCalculations(m).compliantCalcString)}
            </td>
            <td>
              {addTooltip(<span className="user-select-all">{m.pay.toLocaleString()}</span>, getPay(m, formValues).payCalcString)}
            </td>
          </tr>
        ))}
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
};

export default WarDetailsTable;
