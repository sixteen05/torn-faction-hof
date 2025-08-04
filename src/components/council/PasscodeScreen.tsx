import React, { useState } from "react";
import { passcodeValidator } from "./CouncilUtil";

interface PasscodeScreenProps {
  onAuthenticated: () => void;
}

const PasscodeScreen: React.FC<PasscodeScreenProps> = ({ onAuthenticated }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input && passcodeValidator(input)) {
      setError("");
      onAuthenticated();
    } else {
      setError("Incorrect passcode. Try again.");
    }
  };

  return (
    <div className="council-passcode-screen d-flex flex-column justify-content-center align-items-center min-vh-100 bg-dark text-light">
      <form onSubmit={handleSubmit} className="p-4 rounded bg-black border border-secondary" style={{ minWidth: 300 }}>
        <h3 className="mb-3 text-warning">Council Access</h3>
        <div className="mb-3">
          <label htmlFor="passcode" className="form-label">Enter Passcode</label>
          <input
            type="password"
            id="passcode"
            className="form-control bg-dark text-light border-secondary"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
          />
        </div>
        {error && <div className="text-danger mb-2">{error}</div>}
        <button type="submit" className="btn btn-warning w-100">Enter</button>
      </form>
      <div className={"mt-3"}>
        <img src="/public/password.gif" alt="Incorrect password funny GIF"
          className={"img-fluid password-gif mt-2 " + (!error && "hidden")} />
      </div>

      <div className="mt-3 text-muted small">Contact <a href="https://www.torn.com/profile.php?XID=3538936" target="_blank" rel="noopener noreferrer" className="text-info">red-it</a> for access</div>
    </div>
  );
};

export default PasscodeScreen;
