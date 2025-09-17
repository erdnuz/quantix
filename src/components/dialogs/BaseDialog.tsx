'use client';
import React, { ReactNode } from "react";
import { IconArrowLeft } from "../icons";

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
        className="bg-light dark:bg-dark rounded-xl shadow-lg max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header with centered title */}
        <div className="flex items-center justify-center p-4">
          <div className="w-full text-primary-light dark:text-primary-dark text-lg text-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
