"use client";

import { useState } from "react";
import CreateBuyerFormModal from "./form/CreateBuyerForm";
import React from "react";

type Props = {
  className?: string; // allow customizing placement/spacing from parent
  buttonText?: string;
  /**
   * Called when a buyer is successfully created.
   * Receives (phone: string, user?: any)
   */
  onCreated?: (phone: string, user?: any) => void;
};

const CreateBuyerButton: React.FC<Props> = ({
  className = "",
  buttonText = "Create Buyer",
  onCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        // NOTE: no fixed positioning here — parent decides placement
        className={`inline-flex items-center justify-center bg-green-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 text-sm ${className}`}
      >
        {buttonText}
      </button>

      <CreateBuyerFormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreated={(phone, user) => {
          // close buyer modal
          setIsOpen(false);
          // bubble up event to parent
          onCreated?.(phone, user);
        }}
      />
    </>
  );
};

export default CreateBuyerButton;
