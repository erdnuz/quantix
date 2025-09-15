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
  onReturn,
  onClose,
  children,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center p-4 border-b border-gray-200">
          {onReturn && (
            <button
              onClick={onReturn}
              className="mr-2 p-1 rounded hover:bg-gray-100"
            >
              <IconArrowLeft size="28" onClick={()=>{}} />
            </button>
          )}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
