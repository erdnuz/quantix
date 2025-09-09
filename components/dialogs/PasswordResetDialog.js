import React, { useState, useEffect } from "react";
import { auth } from "../../services/firebase/initialization"; 
import { Button } from "../primitive";
import { BaseDialog } from "./BaseDialog";
// import "./DialogForm.css"

export function PasswordResetDialog() {
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
  
    useEffect(() => {
      // Check if we have the reset code in the URL
      const oobCode = new URLSearchParams(window.location.search).get("oobCode");
      if (!oobCode) {
        setError("Invalid reset code.");
      }
    }, []);
  
    const handleResetPassword = async () => {
      const oobCode = new URLSearchParams(window.location.search).get("oobCode");
      
      if (newPassword.length < 6) {
        setError("Password should be at least 6 characters long.");
        return;
      }
  
      setIsResetting(true);
      try {
        await auth.confirmPasswordReset(oobCode, newPassword);
        alert("Password has been reset successfully!");
      } catch (error) {
        setError(`Error resetting password: ${error.message}`);
      } finally {
        setIsResetting(false);
      }
    };
  
    return (
        <BaseDialog isOpen={true} onClose={null}>
        <h2 className="head">Reset Your Password</h2>
        {error && <p className="error small">{error}</p>}
        <div className="input-group">
          <label htmlFor="new-password" className="input-field body">New Password</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="input-field small"
            required
          />
        </div>
        <Button
          onClick={handleResetPassword} 
          label = {isResetting ? "Resetting..." : "Reset Password"}
          disabled={isResetting}
        />
      </ BaseDialog>
    );
};

