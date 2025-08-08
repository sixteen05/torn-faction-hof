import React from "react";

const OCsPage: React.FC = () => (
    <div>
        <h2 className="mb-4">Organized Crimes (OCs)</h2>
        <div className="d-flex flex-column align-items-center justify-content-center">
            <img
                src='/public/in-progress.gif'
                alt="In Progress GIF"
                style={{ width: "480px", height: "356px" }}
                className="mb-3 shadow-lg border border-warning rounded-4"
            />
            <p className="text-warning fw-bold">Feature in progress. Reports for OCs will be shown here soon!</p>
        </div>
    </div>
);

export default OCsPage;
