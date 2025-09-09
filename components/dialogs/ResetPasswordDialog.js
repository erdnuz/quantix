import React, { useState } from "react";
import { BaseDialog } from "./BaseDialog";  // Adjust the import path as needed
import { Button } from "../primitive/Button";    // Adjust the import path as needed
import styles from "@styles/comp/form.module.css";

export function ResetPasswordDialog({ onSend, onReturn, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSendEmail = () => {
    // Check if email is entered
    if (!email) {
      setError("Please enter your email.");
      return;
    }
  
    // Email pattern validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    onSend(email);
  };
  

  return (
    <BaseDialog onReturn={onReturn} onClose={onClose}>
        <h2 className="head">Reset Password</h2>
        {error && <p className={`small ${styles.error}`}>{error}</p>}

        <div className={`${styles.group} column`}>
          <label htmlFor="email" className={`${styles.label} body`}>Email</label>
          <input
            type="email"
            id="email"
            className={`${styles.input} small`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className={`${styles.links} row`} style={{ gap:"8px"}}>
          <Button type="secondary" label="Cancel" onClick={onClose} />
          <Button type="brand" label="Send Email" onClick={handleSendEmail} />
        </div>
    </BaseDialog>
  );
}
