import React, { useState } from "react";
import { Button } from "../primitive/Button"; // Adjust the import path as needed
import { BaseDialog } from "./BaseDialog"; // Assuming BaseDialog is in the components folder
import styles from "@styles/comp/form.module.css";
import { submitForm } from "../../services/firebase/db";

export function ContactDialog({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }
  
    try {
      setError(""); // Clear previous errors
      await submitForm({name, email, message});
      onClose(); // Close dialog after successful submission
    } catch (error) {
      setError(error.message);
      console.error("Form submission error:", error);
    }
  };
  

  function close() {
    setName('');
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  }

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
        <h2 className="head">Contact Us</h2>
        {error && <p className={`small ${styles.error}`}>{error}</p>}

        <div className={`${styles.group} column`}>
          <label htmlFor="name" className={`${styles.label} body`}>Name</label>
          <input
            type="text"
            id="name"
            className={`${styles.input} small`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
          }}
            placeholder="Enter your name"
          />
        </div>

        <div className={`${styles.group} column`}>
          <label htmlFor="email" className={`${styles.label} body`}>Email</label>
          <input
            type="email"
            id="email"
            className={`${styles.input} small`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Enter your email"
          />
        </div>

        <div className={`${styles.group} column`}>
          <label htmlFor="message" className={`${styles.label} body`}>Message</label>
          <textarea
            id="message"
            className={`${styles.input} small`}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError("");
            }}
            placeholder="Enter your message"
            rows="4"
          />
        </div>

        <Button
        type= "brand"
          label="Submit"
          onClick={handleSubmit}
          className="login-button"
        />
    </BaseDialog>
  );
}
