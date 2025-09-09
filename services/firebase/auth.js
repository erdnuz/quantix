import { auth } from './initialization';

import { getUserById, getUserByUsername, addUser, usernameExists, generateUsername} from './db';  // Import the other utility methods

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail
} from "firebase/auth";


async function onApiLogin({id, firstName, lastName, email, onSuccess}) {
  console.log(id);
  const user = await getUserById( id );
  
  if (user) {
    onSuccess(user);
  } else {
    const username = await generateUsername(firstName, lastName);
    const user = await addUser({id, email, username, firstName, lastName, onSuccess});
    onSuccess(user);
  }
  
}


async function createUser(email, password, username, firstName, lastName, onSuccess, onError) {
    if (await usernameExists(username)) {
      console.log('Username is taken: ' + username);
      onError('Username is taken.');
      return;
    }
    console.log(email, password);
    createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      addUser({email, username, firstName, lastName, onSuccess, onError})
    }).catch(()=>{
      onError('Email is already in use.');
    })
  
}

async function loginUser(emailOrUsername, password, onSuccess, onError) {
  let email;
  if (emailOrUsername.includes('@')) {
    email = emailOrUsername;
  } else {
    const user = await getUserByUsername(emailOrUsername);
    if (!user) {
      onError("Wrong email or password");
      return;
    }
    email = user.email;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = getUserById(auth.currentUser.uid);
    onSuccess(user);
  } catch (error) {
    onError("Wrong email or password");
  }
}

async function sendResetEmail(email, onSuccess, onError) {
  try {
    await sendPasswordResetEmail(auth, email);
    onSuccess('Password reset email sent successfully.');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      onError('No user found with this email.');
    } else if (error.code === 'auth/invalid-email') {
      onError('Invalid email address.');
    } else {
      onError('Error sending password reset email.');
    }
  }
}

async function deleteCurrentUser(onSuccess, onError) {
  const user = auth.currentUser;

  if (!user) {
    onError('No user is currently logged in.');
    return;
  }

  try {
    // Before deleting, Firebase requires the user to be re-authenticated if they have not recently logged in.
    await user.delete(); // Deletes the current user from Firebase Authentication

    // If deletion is successful, call onSuccess with a success message
    onSuccess('User deleted successfully.');
  } catch (error) {
    // Handle different types of errors:
    if (error.code === 'auth/requires-recent-login') {
      onError('Please log in again to perform this action.');
    } else if (error.code === 'auth/no-current-user') {
      onError('No user is logged in or the user session has expired.');
    } else {
      onError('Error deleting user: ' + error.message);
    }
  }
}


export { loginUser, createUser, sendResetEmail, onApiLogin, deleteCurrentUser };
