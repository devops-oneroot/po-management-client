"use client";

import { useState } from "react";
import CreateBuyerFormModal from "./form/CreateBuyerForm";
import React from "react";

type Props = {
  className?: string; // allow customizing placement/spacing from parent
  buttonText?: string;
};

const CreateBuyerButton: React.FC<Props> = ({ className = "", buttonText = "Create Buyer" }) => {
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

      <CreateBuyerFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default CreateBuyerButton;
