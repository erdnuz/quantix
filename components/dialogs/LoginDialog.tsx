import React, { useState, useEffect } from "react";
import { BaseDialog } from "./BaseDialog";
import { Button } from "../primitive/Button";
import { loginWithFacebook, loginWithGoogle } from "../../services";

interface LoginDialogProps {
  handleSaveLoginChange: (value: boolean) => void;
  onClose: () => void;
  onReturn?: () => void;
  topError?: string;
  onApiLogin: (userData: any) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  handleSaveLoginChange,
  onClose,
  onReturn,
  topError,
  onApiLogin,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (topError) setError(topError);
  }, [topError]);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
    handleSaveLoginChange(event.target.checked);
  };

  const loginFail = (msg: string) => {
    setError(msg);
  };

  return (
    <BaseDialog onClose={onClose} onReturn={onReturn}>
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

      {/* Google Button */}
      <button
        className="relative flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium shadow-sm hover:bg-gray-50 transition"
        onClick={() => loginWithGoogle(onApiLogin, loginFail)}
      >
        <div className="absolute inset-0 rounded-md bg-gray-100 opacity-0 hover:opacity-20"></div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5">
            <svg viewBox="0 0 48 48" className="w-5 h-5">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
          </div>
          <span>Continue with Google</span>
        </div>
      </button>

      {/* Facebook Button */}
      <button
        className="mt-3 relative flex w-full items-center justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium shadow-sm hover:bg-gray-50 transition"
        onClick={() => loginWithFacebook(onApiLogin, loginFail)}
      >
        <div className="absolute inset-0 rounded-md bg-gray-100 opacity-0 hover:opacity-20"></div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5">
            <svg viewBox="0 0 1365.33 1365.33" className="w-5 h-5">
              <path
                fill="currentColor"
                d="M1365.333 682.667C1365.333 305.64 1059.693 0 682.667 0 305.64 0 0 305.64 0 682.667c0 340.738 249.641 623.16 576 674.373V880H402.667V682.667H576v-150.4c0-171.094 101.917-265.6 257.853-265.6 74.69 0 152.814 13.333 152.814 13.333v168h-86.083c-84.804 0-111.25 52.623-111.25 106.61v128.057h189.333L948.4 880H789.333v477.04c326.359-51.213 576-333.635 576-674.373"
              />
            </svg>
          </div>
          <span>Continue with Facebook</span>
        </div>
      </button>

      {/* Remember me checkbox */}
      <div className="mt-4 flex items-center gap-2">
        <input
          id="rememberMe"
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <label htmlFor="rememberMe" className="text-sm text-gray-700">
          Remember me
        </label>
      </div>
    </BaseDialog>
  );
};
