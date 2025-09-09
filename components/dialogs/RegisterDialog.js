import React, { useState, useEffect } from "react";
import { Button } from "../primitive/Button"; // Adjust the import path as needed
import { BaseDialog } from "./BaseDialog"; // Assuming BaseDialog is in the components folder
import styles from "@styles/comp/form.module.css";

export function RegisterDialog({ onRegister, onReturn, onClose, topError }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {setError(topError)},[topError])
  
  const handleRegister = () => {
    // Check if all fields are filled
    if (!email || !username || !firstName || !lastName || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
  
    // Email pattern validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
  
    // Username validation: must be alphanumeric (letters and numbers only)
    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (!usernamePattern.test(username)) {
      setError("Username must be alphanumeric");
      return;
    }
  
    // Password validation: at least 8 characters, one letter, one number, and one special character
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordPattern.test(password)) {
      setError(
        "Password must be at least 8 characters, including one letter, one number, and one special character"
      );
      return;
    }
  
    // Confirm password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    // Proceed with registration if all checks pass
    onRegister(firstName, lastName, email, username, password);
  };
  
  

  return (
    <BaseDialog onReturn={onReturn} onClose={onClose}>
      
        <h2 className="head">Register</h2>
        {error && <p className={`small ${styles.error}`}>{error}</p>}

        <div className={`${styles.group} column`}>
          <label htmlFor="name" className={`${styles.label} body`}>Name</label>
          <div className={`${styles.names} row`}>
          <input
            type="text"
            id="firstName"
            className={`${styles.input} small`}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              setError("");
            }
            }
            placeholder="First"
          />
          <input
            type="text"
            id="lastName"
            className={`${styles.input} small`}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              setError("");
            }
            }
            placeholder="Last"
          />
          </div>
          
        </div>

        <div className={`${styles.group} column`}>
          <label htmlFor="email" className={`${styles.label} body`}>Email</label>
          <input
            type="text"
            id="email"
            className={`${styles.input} small`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("");
            }
            }
            placeholder="Enter your email"
          />
        </div>
        <div className={`${styles.group} column`}>
          <label htmlFor="username" className={`${styles.label} body`}>Username</label>
          <input
            type="text"
            id="username"
            className={`${styles.input} small`}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError("");
            }
            }
            placeholder="Create a username"
          />
        </div>

        <div className={`${styles.group} column`}>
          <label htmlFor="password" className={`${styles.label} body`}>Password</label>
          <input
            type="password"
            id="password"
            className={`${styles.input} small`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError("");
            }
            }
            placeholder="Create a password"
          />
          <input
            type="password"
            id="confirmPassword"
            className={`${styles.input} small`}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setError("");
            }
            }
            placeholder="Confirm your password"
          />
        </div>

        <Button
        type= "brand"
          label="Register"
          onClick={handleRegister}
          className="login-button"
        />
      
    </BaseDialog>
  );
}
