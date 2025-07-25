import React from "react";
import { Button, Table } from "react-bootstrap";

// Dummy data for demonstration
const chains = [
  { id: 1, count: 50, datetime: "2025-07-20 18:00" },
  { id: 2, count: 120, datetime: "2025-07-22 21:30" },
];

const ChainsPage: React.FC = () => (
  <div>
    <h2>Chains</h2>
    <Table borderless hover responsive>
      <thead>
        <tr>
          <th>#</th>
          <th>Chain Count</th>
          <th>Date/Time</th>
          <th>View</th>
        </tr>
      </thead>
      <tbody>
        {chains.map((chain) => (
          <tr key={chain.id}>
            <td>{chain.id}</td>
            <td>{chain.count}</td>
            <td>{chain.datetime}</td>
            <td><Button variant="primary" size="sm">View</Button></td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);

export default ChainsPage;
