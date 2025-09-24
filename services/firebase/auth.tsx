import { auth } from './initialization';
import { getUserById, addUser, generateUsername } from './db';

import { User as FirebaseUser } from "firebase/auth";
import { SuccessCallback, ErrorCallback, User } from '../../types';
import { FirebaseError } from 'firebase/app';


interface ApiLoginParams {
  id: string;
  firstName: string;
  lastName: string;
  onSuccess: SuccessCallback<User>;
  onError: ErrorCallback
}



// Handles API login: fetch or create user
async function onApiLogin({ id, firstName, lastName, onSuccess, onError }: ApiLoginParams) {
  const user = await getUserById({id});

  if (user) {
    onSuccess(user);
  } else {
    const username = await generateUsername({firstName, lastName});
    const newUser = await addUser({ user: {id, username, firstName, lastName}, onSuccess });
    onSuccess(newUser);
  }
}

// Delete currently authenticated user
async function deleteCurrentUser(onSuccess: SuccessCallback<string>, onError: ErrorCallback) {
  const user: FirebaseUser | null = auth.currentUser;

  if (!user) {
    onError('No user is currently logged in.');
    return;
  }

  try {
    await user.delete();
    onSuccess('User deleted successfully.');
  } catch (error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/requires-recent-login') {
      onError('Please log in again to perform this action.');
    } else if (error.code === 'auth/no-current-user') {
      onError('No user is logged in or the user session has expired.');
    } else {
      onError('Error deleting user: ' + error.message);
    }
  } else if (error instanceof Error) {
    onError('Error deleting user: ' + error.message);
  } else {
    onError('An unknown error occurred.');
  }
}
}

export { onApiLogin, deleteCurrentUser };
