import React, { useState, useEffect } from "react";
import { Button } from "../primitive/Button"; // Adjust the import path as needed
import { BaseDialog } from "./BaseDialog"; // Assuming BaseDialog is in the components folder
import styles from "@styles/comp/form.module.css"
import { usernameExists, deleteUser } from "../../services/firebase/db";
import { deleteCurrentUser } from "../../services/firebase/auth";

export function EditProfileDialog({ isOpen, currentUser, resetCurrentUser, onUpdateProfile, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");


  

  const handleUpdateProfile = async () => {
    const usernameChanged = username && username !== currentUser?.username;
    const firstNameChanged = firstName && firstName !== currentUser?.firstName;
    const lastNameChanged = lastName && lastName !== currentUser?.LastName;

    // Check if any of the fields have changed
    if (!(usernameChanged || firstNameChanged || lastNameChanged)) {
      close();
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9]+$/;
    if (username && !usernamePattern.test(username)) {
      setError("Username must be alphanumeric");
      return;
    }

    if (await usernameExists(username)) {
      setError("Username is taken.");
      return;
    }
    onUpdateProfile({firstName:firstName || currentUser.firstName, lastName:lastName||currentUser.lastName, username:username||currentUser.username});
    close()
  };

  const handleDeleteProfile = async () => {
    // Step 1: Confirm the user really wants to delete their profile
    const confirmation = window.confirm("Are you sure you want to delete your profile? This action cannot be undone.");
  
    if (!confirmation) {
      return;  // Exit the function if the user doesn't confirm
    }  
    deleteUserProfile();
      
  };
  
  // Example of the deleteUserProfile function
  const deleteUserProfile = async () => {
    await deleteUser( currentUser?.id, ()=>{}, (message)=>{setError(message);})
    await deleteCurrentUser(()=>{resetCurrentUser(); close()}, (message)=>{setError(message);})
    
  };
  

  function close() {
    setFirstName('');
    setLastName('');
    setUsername('');
    setError('');
    onClose();
  }

  return (
    <BaseDialog isOpen = {isOpen} onClose={close}>
      <h2 className="head">Edit Profile</h2>
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
              setFirstName(e.target.value);
              setError("");
            }}
            placeholder={currentUser?.firstName}
          />
          <input
            type="text"
            id="lastName"
            className={`${styles.input} small`}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setError("");
            }}
            placeholder={currentUser?.lastName}
          />
        </div>
      </div>

      <div className={`${styles.group} column`}>
        <label htmlFor="username" className={`${styles.label} body`}>Username</label>
        <input
          type="text"
          id="username"
          className={`${styles.input} small`}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError("");
          }}
          placeholder={currentUser?.username}
        />
      </div>
      <div>
      <div className={styles.links} style={{gap:'8px', marginBottom:'8px'}}>
            <Button
              type="secondary"
              label="Cancel"
              onClick={close}
              className="login-button"
            />
            <Button
              type="brand"
              label="Update"
              onClick={handleUpdateProfile}
              className="login-button"
            />
            </div>    
            <Button type="brand" icon='trash' label="Delete Account" onClick={handleDeleteProfile
            }/> 
          </div>
       
    </BaseDialog>
  );
}
