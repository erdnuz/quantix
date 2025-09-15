import { auth } from "./firebase/initialization";
import { signInWithPopup, FacebookAuthProvider, User, UserCredential } from "firebase/auth";

// Initialize the Facebook Auth Provider
const provider = new FacebookAuthProvider();
provider.addScope("email");

type FacebookLoginSuccess = (user: { id: string; firstName: string; lastName: string }) => void;
type FacebookLoginError = (error: any) => void;

export function loginWithFacebook(onSuccess: FacebookLoginSuccess, onError?: FacebookLoginError) {
  signInWithPopup(auth, provider)
    .then((result: UserCredential) => {
      const user: User = result.user;
      const fullName = user.displayName || "";

      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      onSuccess({
        id: user.uid,
        firstName,
        lastName,
      });
    })
    .catch((error: Error) => {
      console.error("Error during login:", error);
      if (onError) onError(error);
    });
}
