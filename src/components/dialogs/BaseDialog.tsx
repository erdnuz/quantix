'use client';
import React, { ReactNode } from "react";

interface BaseDialogProps {
  onReturn?: () => void;
  onClose: () => void;
  children: ReactNode;
  isOpen?: boolean;
}

export const BaseDialog: React.FC<BaseDialogProps> = ({
  onClose,
  children,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-light dark:bg-dark rounded-xl shadow-lg w-full max-w-3xl mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional header can be added here if needed */}
        
        {/* Body */}
        <div className="w-full p-4 text-primary-light dark:text-primary-dark">
          {children}
        </div>
      </div>
    </div>
  );
};
