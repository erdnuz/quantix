
import { auth } from "./firebase/initialization";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";

// Initialize the Facebook Auth Provider
const provider = new FacebookAuthProvider();

// Add necessary scopes (e.g., email)
provider.addScope('email');

// Function to handle Facebook Login with success and error callbacks
export function loginWithFacebook(onSuccess, onError) {
  signInWithPopup(auth, provider)
    .then((result) => {
      // Retrieve user information
      const user = result.user;
      const fullName = user.displayName;
      

      let firstName = '';
      let lastName = '';
      if (fullName) {
        const nameParts = fullName.split(' ');
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
      }

      onSuccess({
        id:auth.currentUser.uid,
        firstName,
        lastName}) 
        
    })
    .catch((error) => {
      console.error('Error during login:', error);
      if (onError) {
        onError(error);
      }
    });
}
