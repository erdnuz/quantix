'use client';
import React, { useState } from "react";
import { LoginDialog, RegisterDialog, ResetPasswordDialog } from "./";
import { onApiLogin } from '../../services/firebase/auth';
import { User } from "../../types";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  handleSaveLoginChange: (value: any) => void; // adjust type as needed
  setCurrentUser: (user: User) => void;
}

export const AuthDialog: React.FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  handleSaveLoginChange,
  setCurrentUser,
}) => {
  const [currentDialog, setCurrentDialog] = useState<"login" | "register" | "resetPassword">("login");
  const [error, setError] = useState<string>("");

  // Switch dialogs
  const openLoginDialog = () => setCurrentDialog("login");
  const openRegisterDialog = () => setCurrentDialog("register");
  const openResetPasswordDialog = () => setCurrentDialog("resetPassword");

  const closeDialog = () => {
    setError("");
    setCurrentDialog("login");
    onClose();
  };

  // Handle API login
  const handleLoginApi = async ({ id, firstName, lastName }: {id:string, firstName:string, lastName:string}) => {
    onApiLogin({
      id,
      firstName,
      lastName,
      onSuccess: (user: User) => {
        setCurrentUser(user);
        closeDialog();
      },
      onError: () => {
        setError("Wrong username/email or password.");
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div>
      {currentDialog === "login" && (
        <LoginDialog
          onClose={closeDialog}
          handleSaveLoginChange={handleSaveLoginChange}
          onReturn={openLoginDialog}
          onApiLogin={handleLoginApi}
          topError={error}
        />
      )}
      
    </div>
  );
};
