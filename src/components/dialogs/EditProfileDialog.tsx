import React, { useState } from "react";
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

  const close = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setError("");
    onClose();
  };

  const handleUpdateProfile = async () => {
    const usernameChanged = username && username !== currentUser?.username;
    const firstNameChanged = firstName && firstName !== currentUser?.firstName;
    const lastNameChanged = lastName && lastName !== currentUser?.lastName;

    if (!(usernameChanged || firstNameChanged || lastNameChanged)) {
      close();
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (username && !usernamePattern.test(username)) {
      setError("Username must be alphanumeric");
      return;
    }

    if (username && (await usernameExists({username}))) {
      setError("Username is taken.");
      return;
    }

    onUpdateProfile({
      firstName: firstName || currentUser!.firstName,
      lastName: lastName || currentUser!.lastName,
      username: username || currentUser!.username,
    });
    close();
  };

  const deleteUserProfile = async () => {
    if (!currentUser) return;
    await deleteUser({
      userId:currentUser.id,
      onSuccess: () => {},
      onError: setError
    });
    await deleteCurrentUser(
      () => {
        resetCurrentUser();
        close();
      },
      (message) => setError(message)
    );
  };

  const handleDeleteProfile = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your profile? This action cannot be undone."
    );
    if (!confirmation) return;
    deleteUserProfile();
  };

  return (
    <BaseDialog isOpen={isOpen} onClose={close}>
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Name Inputs */}
      <div className="flex flex-col gap-2 mb-4">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Name
        </label>
        <div className="flex flex-row gap-2">
          <input
            type="text"
            id="firstName"
            className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setError("");
            }}
            placeholder={currentUser?.firstName || "First name"}
          />
          <input
            type="text"
            id="lastName"
            className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
            placeholder={currentUser?.lastName || "Last name"}
          />
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2 mb-6">
        <label htmlFor="username" className="text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          type="text"
          id="username"
          className="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder={currentUser?.username || "Username"}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button type="secondary" label="Cancel" onClick={close} />
          <Button type="brand" label="Update" onClick={handleUpdateProfile} />
        </div>
        <Button
          type="brand"
          icon="trash"
          label="Delete Account"
          onClick={handleDeleteProfile}
        />
      </div>
    </BaseDialog>
  );
};
