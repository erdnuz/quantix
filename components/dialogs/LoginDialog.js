import React, { useState, useEffect } from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "../primitive/Button"; // Adjust the import path as needed
import styles from "@styles/comp/form.module.css";
// import "./SignIn.css"
import { loginWithFacebook, loginWithGoogle} from "../../services";

export function LoginDialog({ handleSaveLoginChange, onLogin, onForgotPassword, onRegister, onClose, topError, onApiLogin }) {
    const [emailOrUsername, setEmailOrUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {setError(topError)},[topError])
  
    const handleLogin = () => {    
      if (!emailOrUsername || !password) {
        setError("Please enter email/username and password.");
        return;
      }
  
      setError("");
      onLogin(emailOrUsername, password);
    };
    
  
  const handleResetPassword = () => {
    onForgotPassword();
  };
  
  const handleRegister = () => {
    onRegister();
  };
  
  function loginFail(error) {
    setError("Third-party login failed.");
  }

  // Handle the checkbox change to update the isChecked state and call handleSaveLoginChange
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
    handleSaveLoginChange(event.target.checked);  // Call the parent handler to store the preference
  };

  return (
    <BaseDialog onClose={onClose}>
      <h2 className="head">Login</h2>
        {error && <p className={`small ${styles.error}`}>{error}</p>}

        <div className={styles.group}>
          <label htmlFor="emailOrUsername" className={`body ${styles.label}`}>Email or Username</label>
          <input
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            className={`${styles.input} small`}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              setError('');
            }}
            placeholder="Enter your email or username"
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="password" className={`body ${styles.label}`}>Password</label>
          <input
            type="password"
            id="password"
            value={password}
            className={`${styles.input} small`}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter your password"
          />
        </div>

        <Button
        type= "brand"
          label="Continue"
          onClick={handleLogin}
          className={styles.sbutton}
        />


      <h2 className="subhead" style={{ textAlign: "center", margin: "0px" }}>OR</h2>
      
      <button className={styles["gsi-material-button"]} onClick={() => {loginWithGoogle(onApiLogin, loginFail)}}>
        <div className={styles["gsi-material-button-state"]}></div>
        <div className={styles["gsi-material-button-wrapper"]}>
          <div className={styles["gsi-material-button-icon"]}>
            <svg version="1.1" viewBox="0 0 48 48" style={{display: 'block'}}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span className={styles["gsi-material-button-contents"]}>Continue with Google</span>
        </div>
      </button> 

      <button className={styles["gsi-material-button"]} onClick={() => {loginWithFacebook(onApiLogin, loginFail)}}>
        <div className={styles["gsi-material-button-state"]}></div>
        <div className={styles["gsi-material-button-wrapper"]}> 
          <div className={styles["gsi-material-button-icon"]}>
          <svg version="1.1" style={{display: 'block'}} viewBox="0 0 1365.33 1365.33">           
          <path fill="var(--sds-color-text-default-default)" d="M1365.333 682.667C1365.333 305.64 1059.693 0 682.667 0 305.64 0 0 305.64 0 682.667c0 340.738 249.641 623.16 576 674.373V880H402.667V682.667H576v-150.4c0-171.094 101.917-265.6 257.853-265.6 74.69 0 152.814 13.333 152.814 13.333v168h-86.083c-84.804 0-111.25 52.623-111.25 106.61v128.057h189.333L948.4 880H789.333v477.04c326.359-51.213 576-333.635 576-674.373" />         
          </svg>
          </div>
          <span className={styles["gsi-material-button-contents"]}>Continue with Facebook</span>
        </div>
      </button>
      
      {/* Remember me checkbox */}
      <div className={styles.rcontainer}>
        <input className={styles.checkbox}
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />

        <label className={`${styles.rlabel} small`}>
          
          Remember me
        </label>

      </div>

      <div className={styles.links}>
          <button onClick={handleResetPassword} className={`${styles.lbutton} small`}>
            Reset Password
          </button>
          <button onClick={handleRegister} className={`${styles.lbutton} small`}>
            Register
          </button>
        </div>
    </BaseDialog>
  );
}
