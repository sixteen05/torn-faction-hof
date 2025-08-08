import React, { useState } from "react";
import { Table } from "react-bootstrap";
import { allTypeSortFunction, wrapWithTooltip } from "../CouncilUtil";
import type { ChainMemberAggregate, ChainPayFormValues } from "../Models";

interface ChainDetailsTableProps {
  memberAggregates: ChainMemberAggregate[];
  formValues: ChainPayFormValues;
  getPay: (member: ChainMemberAggregate, values: ChainPayFormValues) => { pay: number; attackCount: number };
}

interface ChainMemberAggregateWithPay extends ChainMemberAggregate {
  pay: number;
  payCalcString: string[];
  attackCount: number;
  attackCalcString: string[];
}

const columnDataTypesList = {
  alphanumeric: ["userTag"],
  number: ["respect", "averageRespect", "attackCount", "pay"],
  boolean: []
};

const floatToString = (value: number) => {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const getChainCalcStrings = (member: ChainMemberAggregateWithPay, formValues: any) => {
  const payCalcString = [];

  // Pay calculation string based on average respect
  payCalcString.push(
    `${member.attacks.toLocaleString()} × ` +
    (member.averageRespect >= formValues.respectThreshold
      ? formValues.payAboveThreshold.toLocaleString()
      : formValues.payBelowThreshold.toLocaleString()));
  payCalcString.push(
    `(${floatToString(member.averageRespect)} ${member.averageRespect >= formValues.respectThreshold ? '≥' : '<'} ${floatToString(formValues.respectThreshold)})`
  );

  const attackCalcString = [];
  for (let [type, count] of Object.entries(member.attackBreakdown)) {
    if (type !== "Attacked")
      type = '*' + type;

    attackCalcString.push(`${type}: ${count.toLocaleString()}`);
  }

  attackCalcString.sort((a, b) => a.localeCompare(b));
  return { payCalcString, attackCalcString };
};

const ChainDetailsTable: React.FC<ChainDetailsTableProps> = (props: ChainDetailsTableProps) => {
  const { memberAggregates, formValues, getPay } = props;
  const [sortCol, setSortCol] = useState<string>("pay");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const aggregatesWithCalc: ChainMemberAggregateWithPay[] = memberAggregates.map(member => {
    const { attackCount, pay } = getPay(member, formValues);
    const { payCalcString, attackCalcString } = getChainCalcStrings({ ...member, averageRespect: member.averageRespect, attacks: attackCount }, formValues);
    return { ...member, pay, attackCount, payCalcString, attackCalcString };
  });

  const sortedAggregates: ChainMemberAggregateWithPay[] = [...aggregatesWithCalc].sort((a, b) => {
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
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("userTag")}>Member {sortCol === "userTag" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("respect")}>Total Respect {sortCol === "respect" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("averageRespect")}>Avg Respect {sortCol === "averageRespect" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("attackCount")}>Attacks {sortCol === "attackCount" && (sortDir === "asc" ? "▲" : "▼")}</th>
          <th style={{ cursor: "pointer" }} onClick={() => handleSort("pay")}>Pay {sortCol === "pay" && (sortDir === "asc" ? "▲" : "▼")}</th>
        </tr>
      </thead>
      <tbody>
        {sortedAggregates.map((member: ChainMemberAggregateWithPay) => {
          return (
            <tr key={member.userTag}>
              <td>{member.userTag}</td>
              <td>{floatToString(member.respect)}</td>
              <td>{floatToString(member.averageRespect)}</td>
              <td>{wrapWithTooltip(<span>{member.attacks.toLocaleString()}</span>, member.attackCalcString)}</td>
              <td className="user-select-all">{wrapWithTooltip(<span>{member.pay.toLocaleString()}</span>, member.payCalcString)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot className="table-active">
        <tr className="fw-bold">
          <td>Total</td>
          <td>{sortedAggregates.reduce((sum: number, member: ChainMemberAggregateWithPay) => sum + member.respect, 0)}</td>
          <td>{sortedAggregates.length > 0 ? floatToString(sortedAggregates.reduce((sum: number, member: ChainMemberAggregateWithPay) => sum + member.averageRespect, 0) / sortedAggregates.length) : 0}</td>
          <td>{sortedAggregates.reduce((sum: number, member: ChainMemberAggregateWithPay) => sum + member.attacks, 0)}</td>
          <td>{sortedAggregates.reduce((sum: number, member: ChainMemberAggregateWithPay) => {
            return sum + member.pay;
          }, 0).toLocaleString()}</td>
        </tr>
      </tfoot>
    </Table>
  );
};

export default ChainDetailsTable;
