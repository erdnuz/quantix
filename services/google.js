import { auth } from "./firebase/initialization";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Initialize the Google Auth Provider
const provider = new GoogleAuthProvider();

// Function to handle Google Login with success and error callbacks
export function loginWithGoogle(onSuccess, onError ) {
  signInWithPopup(auth, provider)
    .then((result) => {

      const user = result.user;
      const email = user.email;
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
        lastName,
        email
      });
      
    })
  
    .catch((error) => {
    
        console.log(error);
        if (onError) {
          onError(error);
        }
      
      
    });
}
