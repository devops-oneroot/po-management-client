"use client";
import React, { useEffect, useState } from "react";
import { Search, Plus, UserPlus, RefreshCw } from "lucide-react";
import { findUserByPhone, createAggregatorLead /*, createBuyer */ } from "../services/api"; // adjust path
import { Toast } from "../components/Toast"; // adjust path if needed
import type { AggregatorData } from "../types"; // adjust path

type CombinedCreateFormProps = {
  // optional callbacks to refresh lists after create
  onCreated?: () => void;
  initialMode?: "aggregator" | "buyer";
};

export const CombinedCreateForm: React.FC<CombinedCreateFormProps> = ({ onCreated, initialMode = "aggregator" }) => {
  // mode: whether creating aggregator or buyer (renders both sections but switches primary button)
  const [mode, setMode] = useState<"aggregator" | "buyer">(initialMode);

  // Shared personal fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");

  // KYC & address
  const [aadhaarPan, setAadhaarPan] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");

  // Aggregator specific
  const [crop, setCrop] = useState("");
  const [capacity, setCapacity] = useState<string | number>("");
  const [capacityUnit, setCapacityUnit] = useState("");
  const [confidenceScore, setConfidenceScore] = useState<string | number>("");
  const [experienceYears, setExperienceYears] = useState<string | number>("");
  const [loadFrequency, setLoadFrequency] = useState("");

  // Location display-only (for aggregator form right side)
  const [stateValue, setStateValue] = useState("");
  const [districtValue, setDistrictValue] = useState("");
  const [talukValue, setTalukValue] = useState("");
  const [villageValue, setVillageValue] = useState("");

  // lookup / flags
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundUserId, setFoundUserId] = useState<string | null>(null);

  // UI / toast
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" }>({ show: false, message: "", type: "success" });
  const [saving, setSaving] = useState(false);

  // simple helper toast
  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // phone lookup - prefill fields if user found
  const handleLookup = async () => {
    if (!phone) {
      showToast("Enter phone number to lookup", "info");
      return;
    }
    try {
      setLookupLoading(true);
      const user = await findUserByPhone(phone);
      if (user && user.id) {
        setFoundUserId(user.id);
        // map fields if available
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setAltPhone(user.altPhone ?? "");
        // address mapping (if available)
        setPermanentAddress(user.address ?? "");
        setStateValue(user.state ?? "");
        setDistrictValue(user.district ?? "");
        setTalukValue(user.taluk ?? "");
        setVillageValue(user.village ?? "");
        showToast("User found and prefilled", "success");
      } else {
        setFoundUserId(null);
        showToast("User not found", "info");
      }
    } catch (err) {
      console.error("lookup error", err);
      showToast("Lookup failed", "error");
    } finally {
      setLookupLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setName(""); setPhone(""); setAltPhone(""); setEmail("");
    setAadhaarPan(""); setPermanentAddress("");
    setCrop(""); setCapacity(""); setCapacityUnit(""); setConfidenceScore("");
    setExperienceYears(""); setLoadFrequency("");
    setStateValue(""); setDistrictValue(""); setTalukValue(""); setVillageValue("");
    setFoundUserId(null);
  };

  // Basic validation
  const validateCommon = () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push("Name is required");
    if (!phone.trim()) errors.push("Phone is required");
    return errors;
  };

  // Create buyer flow (placeholder - replace createBuyer with your real API)
  const handleCreateBuyer = async () => {
    const errs = validateCommon();
    if (errs.length) {
      showToast(errs.join(", "), "error");
      return;
    }
    try {
      setSaving(true);
      // Replace this block with your actual createBuyer API call
      // Example payload:
      const buyerPayload = {
        name,
        phone,
        altPhone: altPhone || null,
        email: email || null,
        aadhaarPan: aadhaarPan || null,
        address: permanentAddress || null,
      };

      // await createBuyer(buyerPayload); // <-- uncomment and replace with your function
      // simulate success:
      await new Promise((r) => setTimeout(r, 600));
      showToast("Buyer created successfully", "success");
      resetForm();
      onCreated?.();
    } catch (err) {
      console.error("create buyer error", err);
      showToast("Failed to create buyer", "error");
    } finally {
      setSaving(false);
    }
  };

  // Create aggregator flow (uses createAggregatorLead)
  const handleCreateAggregator = async () => {
    const errs = validateCommon();
    if (!crop.trim()) errs.push("Crop is required");
    if (errs.length) {
      showToast(errs.join(", "), "error");
      return;
    }

    try {
      setSaving(true);

      const aggPayload: Partial<AggregatorData> = {
        name,
        number: phone,
        alternatePhone: altPhone || null,
        email: email || null,
        address: permanentAddress || null,
        aadhaarPan: aadhaarPan || null,
        cropName: crop || null,
        capacity: capacity ? Number(capacity) : null,
        capacityUnit: capacityUnit || null,
        confidence: confidenceScore ? Number(confidenceScore) : null,
        experience: experienceYears ? Number(experienceYears) : null,
        frequency: loadFrequency || null,
        state: stateValue || null,
        district: districtValue || null,
        taluk: talukValue || null,
        village: villageValue || null,
        userId: foundUserId ?? undefined, // if found, attach
      };

      await createAggregatorLead(aggPayload);
      showToast("Aggregator lead created", "success");
      resetForm();
      onCreated?.();
    } catch (err) {
      console.error("create aggregator error", err);
      showToast("Failed to create aggregator", "error");
    } finally {
      setSaving(false);
    }
  };

  // Combined submit (calls either buyer or aggregator)
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (mode === "buyer") await handleCreateBuyer();
    else await handleCreateAggregator();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 grid grid-cols-2 gap-6">
      {/* Left column: Create Buyer style */}
      <div className="p-6 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Create Buyer / Personal</h3>
            <p className="text-sm text-gray-500">Register buyer or personal details (shared)</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMode("buyer"); }}
              className={`px-3 py-1 rounded ${mode === "buyer" ? "bg-emerald-600 text-white" : "bg-white border"}`}
            >
              Buyer
            </button>
            <button
              onClick={() => { setMode("aggregator"); }}
              className={`px-3 py-1 rounded ${mode === "aggregator" ? "bg-emerald-600 text-white" : "bg-white border"}`}
            >
              Aggregator
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-600">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Mobile Number</label>
              <div className="relative mt-1">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded border pr-24" />
                <button type="button" onClick={handleLookup} disabled={lookupLoading} className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 text-white px-3 py-1 rounded text-xs">
                  {lookupLoading ? "..." : (<><Search size={14} /> Lookup</>)}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-600">Alternate Phone</label>
              <input value={altPhone} onChange={(e) => setAltPhone(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600">Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
          </div>

          <hr className="my-2" />

          <div>
            <label className="text-xs text-gray-600">Aadhar / PAN Number</label>
            <input value={aadhaarPan} onChange={(e) => setAadhaarPan(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="text-xs text-gray-600">Permanent Address</label>
            <textarea value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border h-24" />
          </div>

          <div className="pt-3">
            {/* Primary action is dynamic based on mode */}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className={`flex items-center gap-2 px-4 py-2 rounded ${mode === "buyer" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"}`}>
                {mode === "buyer" ? (<><UserPlus size={16} /> Create Buyer</>) : (<><Plus size={16} /> Create Aggregator</>)}
              </button>

              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded bg-white">
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Right column: Aggregator business details */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Create Aggregator Lead</h3>
        <p className="text-sm text-gray-500 mb-4">Log business details and potential lead information.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Crop *</label>
            <input value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-600">Capacity</label>
              <input value={capacity} onChange={(e) => setCapacity(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Unit</label>
              <input value={capacityUnit} onChange={(e) => setCapacityUnit(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Confidence score</label>
              <input value={confidenceScore} onChange={(e) => setConfidenceScore(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Experience (years)</label>
              <input value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>

            <div>
              <label className="text-xs text-gray-600">Load Frequency</label>
              <input value={loadFrequency} onChange={(e) => setLoadFrequency(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border" />
            </div>
          </div>

          <hr />

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Location (display only)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">State</label>
                <input value={stateValue} onChange={(e) => setStateValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border bg-gray-50" />
              </div>

              <div>
                <label className="text-xs text-gray-500">District</label>
                <input value={districtValue} onChange={(e) => setDistrictValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border bg-gray-50" />
              </div>

              <div>
                <label className="text-xs text-gray-500">Taluk</label>
                <input value={talukValue} onChange={(e) => setTalukValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border bg-gray-50" />
              </div>

              <div>
                <label className="text-xs text-gray-500">Village</label>
                <input value={villageValue} onChange={(e) => setVillageValue(e.target.value)} className="mt-1 w-full px-3 py-2 rounded border bg-gray-50" />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3 justify-end">
            <button onClick={resetForm} className="px-4 py-2 border rounded bg-white text-sm">Clear</button>
            <button onClick={handleCreateAggregator} disabled={saving} className="px-4 py-2 bg-emerald-600 text-white rounded">
              <Plus size={14} /> Create Aggregator Lead
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast({ show: false, message: "", type: "success" })} />
    </div>
  );
};

export default CombinedCreateForm;
