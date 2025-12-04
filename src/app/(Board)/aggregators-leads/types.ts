export type QuantityUnit =
  | "QUINTAL"
  | "TON"
  | "PIECE"
  | "KILOGRAM"
  | "GRAM"
  | "LITRE"
  | "BAG"
  | "BOX"
  | "";

export type LoadFrequency =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "SEASONAL"
  | string;

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  show: boolean;
  message: string;
  type: ToastType;
  onClose: () => void;
}

export interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export interface AggregatorData {
  id: string | number | null;
  userId?: string | null;
  onboarded?: string | null;
  name?: string | null;
  number?: string | null;
  // location fields kept in UI context but NOT sent to backend
  state?: string | null;
  district?: string | null;
  taluk?: string | null;
  village?: string | null;

  experience?: string | null;
  capacity?: string | null;
  capacityUnit?: QuantityUnit | null;
  tAndC?: string | null; // maps to isTcCompliant
  nextAction?: string | null;
  nextActionDueDate?: string | null;
  interestTo?: string | null; // maps to isInterestedToWork
  readyToSupply?: string | null; // UI date, maps to nextReadyDate
  tag?: string | null;
  confidence?: string | null; // maps to operationScore
  lastInteracted?: string | null; // UI date -> lastInteractedAt
  interestedCompanies?: string | null; // Display string for table
  interestsCompaniesIds?: string[];
  // feVisited is UI-only: DO NOT send to backend
  feVisited?: string | null;
  hasStock?: "Yes" | "No" | "" | null;
  notes?: string | null;
  radius?: string | null; // display string; accurateRadius will be numeric in payload
  otherCrops?: string[];
  isVisited?: boolean;
  cropName?: string | null;
  buyerType?: string | null;
  updatedAt?: string | null;
  frequency?: LoadFrequency | null;
  currentStock?: number | null;
  currentStockUnit?: QuantityUnit | null;
  // new entity fields
  accurateRadius?: number | null;
  isInterestedToWork?: boolean | null;
  nextActionDueDateRaw?: string | null;

  // raw backend object can be stored if needed
  __raw?: any;
  __rawUserFromLookup?: any;
}

export interface ColumnSelection {
  onboarded: boolean;
  name: boolean;
  number: boolean;
  state: boolean;
  district: boolean;
  taluk: boolean;
  village: boolean;
  experience: boolean;
  capacity: boolean;
  capacityUnit: boolean;
  tAndC: boolean;
  nextAction: boolean;
  interestTo: boolean;
  readyToSupply: boolean;
  tag: boolean;
  confidence: boolean;
  lastInteracted: boolean;
  interestedCompanies: boolean;
  interestsCompaniesIds: boolean;
  feVisited: boolean;
  hasStock: boolean;
  notes: boolean;
  radius: boolean;
  otherCrops: boolean;
  isVisited: boolean;
  cropName: boolean;
  buyerType: boolean;
  updatedAt: boolean;
}

export interface Company {
  id: string;
  name: string;
  displayName?: string;
}

