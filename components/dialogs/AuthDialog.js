import React, { useState } from "react";
import { LoginDialog, RegisterDialog, ResetPasswordDialog } from "./";
import { loginUser, createUser, sendResetEmail, onApiLogin } from '../../services/firebase/auth';


export function AuthDialog({ isOpen, onClose, handleSaveLoginChange, setCurrentUser }) {
  const [currentDialog, setCurrentDialog] = useState("login");
  const [error, setError] = useState("");

  // Switch to the login dialog
  const openLoginDialog = () => {
    setCurrentDialog("login");
  };  

  // Switch to the register dialog
  const openRegisterDialog = () => {
    setCurrentDialog("register");
  };

  // Switch to the reset password dialog
  const openResetPasswordDialog = () => {
    setCurrentDialog("resetPassword");
  };

  // Close the current dialog
  const closeDialog = () => {
    setError("")
    setCurrentDialog('login');
    onClose();
  };

  const handleLoginApi = async ({id, email, firstName, lastName}) => {
    onApiLogin({id, email, firstName, lastName,
      onSuccess: (user) => {
        setCurrentUser(user);
        closeDialog();
      },
      onError: (error) => {
        setError("Wrong username/email or password.");
      }
  });
  };
  
  // Handle user login
  const handleLoginUser = async (emailOrUsername, password) => {
    loginUser(emailOrUsername, password, 
      (user) => {
        setCurrentUser(user);
        closeDialog();
      },
      (message) => {
        setError(message);
      }
    );
  };

  const handleRegisterUser = async (firstName, lastName, email, username, password) => {
    createUser(email, password, username, firstName, lastName, 
      (user) => {
        setCurrentUser(user);
        closeDialog();
      },
      (message) => {
        setError(message);
      }
    );
  };
  
  // Handle sending password reset email
  const handleSendReset = async (email) => {
    try {
      sendResetEmail(email,
        () => {
          closeDialog();
        },
        (error) => {
          setError("Password reset error.");
        }
      );
    } catch (error) {
      setError("Password reset error.");
    }
  };

  if (!isOpen) return null;

  return (
    <div>
      {currentDialog === "login" && (
        <LoginDialog 
          onClose={closeDialog}
          handleSaveLoginChange = {handleSaveLoginChange}
          onLogin={handleLoginUser}
          onForgotPassword={openResetPasswordDialog}
          onRegister={openRegisterDialog}
          onReturn={openLoginDialog}
          onApiLogin = {handleLoginApi}
          topError = {error}
        />
      )}
      {currentDialog === "register" && (
        <RegisterDialog
          onRegister={handleRegisterUser}
          onClose={closeDialog}
          onReturn={openLoginDialog}
          topError = {error}
        />
      )}
      {currentDialog === "resetPassword" && (
        <ResetPasswordDialog
          onSend={handleSendReset}
          onReturn={openLoginDialog}
          onClose={closeDialog}
          topError = {error}
        />
      )}
    </div>
  );
}
