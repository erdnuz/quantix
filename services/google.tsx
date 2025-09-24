import { SuccessCallback, ErrorCallback, User } from "../types";
import { auth } from "./firebase/initialization";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to handle Google Login with success and error callbacks
export function loginWithGoogle(onSuccess: SuccessCallback<Partial<User>>, onError: ErrorCallback ) {
  signInWithPopup(auth, provider)
    .then((result) => {

      const user = result.user;
      const fullName = user.displayName;
      
      let firstName = '';
      let lastName = '';
      if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
      }
      
      if (auth.currentUser) {
        onSuccess({
          id:auth.currentUser.uid,
          firstName,
          lastName
        });
      } else {
        onError("Third-party authentication failed")
      }
      
    })
  
    .catch((error) => {
    
        console.log(error);
        if (onError) {
          onError(error);
        }
      
      
    });
}
