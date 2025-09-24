import React, { useState, useEffect } from "react";
import { Button } from "../primitive/Button";
import { BaseDialog } from "./BaseDialog";
import { usernameExists, deleteUser } from "../../../services/firebase/db";
import { deleteCurrentUser } from "../../../services/firebase/auth";
import { User } from "../../../types";

interface EditProfileDialogProps {
  isOpen: boolean;
  currentUser: User;
  resetCurrentUser: () => void;
  onUpdateProfile: (user: { firstName: string; lastName: string; username: string }) => void;
  onClose: () => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  isOpen,
  currentUser,
  resetCurrentUser,
  onUpdateProfile,
  onClose,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setUsername(currentUser.username);
    }
  }, [currentUser]);

  const close = () => {
    setError("");
    onClose();
  };

  const handleUpdateProfile = async () => {
    const usernameChanged = username && username !== currentUser.username;
    const firstNameChanged = firstName && firstName !== currentUser.firstName;
    const lastNameChanged = lastName && lastName !== currentUser.lastName;

    if (!(usernameChanged || firstNameChanged || lastNameChanged)) {
      close();
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (username && !usernamePattern.test(username)) {
      setError("Username must be alphanumeric");
      return;
    }

    if (username && (await usernameExists({ username }))) {
      setError("Username is taken.");
      return;
    }

    onUpdateProfile({
      firstName: firstName || currentUser.firstName,
      lastName: lastName || currentUser.lastName,
      username: username || currentUser.username,
    });
    close();
  };

  const handleDeleteProfile = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );
    if (!confirmation) return;

    await deleteUser({
      userId: currentUser.id,
      onSuccess: async () => {
        await deleteCurrentUser(
          () => {
            resetCurrentUser();
            close();
          },
          (message) => setError(message)
        );
      },
      onError: setError,
    });
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <div className="flex flex-col gap-4 min-w-[280px] sm:min-w-[360px] md:min-w-[480px]">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Edit Profile</h2>
        {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}

        {/* Name Inputs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium">Name</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="flex-1 rounded-md border border-border-light dark:border-border-dark bg-light dark:bg-dark px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setError("");
              }}
              placeholder="First Name"
            />
            <input
              type="text"
              className="flex-1 rounded-md border border-border-light dark:border-border-dark bg-light dark:bg-dark px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setError("");
              }}
              placeholder="Last Name"
            />
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium">Username</label>
          <input
            type="text"
            className="w-full rounded-md border border-border-light dark:border-border-dark bg-light dark:bg-dark px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError("");
            }}
            placeholder="Username"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2">
            <Button type="secondary" label="Cancel" onClick={close} className="flex-1" />
            <Button type="brand" label="Update" onClick={handleUpdateProfile} className="flex-1" />
          </div>
          <Button
            type="primary"
            icon="trash"
            label="Delete Account"
            onClick={handleDeleteProfile}
            className="w-full justify-center"
          />
        </div>
      </div>
    </BaseDialog>
  );
};
