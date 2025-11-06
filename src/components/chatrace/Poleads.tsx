"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Phone,
  Clock,
  Loader2,
  AlertCircle,
  Edit3,
  X,
  CheckCircle2,
} from "lucide-react";

interface Lead {
  id: string;
  user: { name: string };
  mobileNumber: string;
  platform: string;
  rate: number;
  createdAt: string;
}

interface PoleadsProps {
  id: string; // PO ID
}

const Poleads: React.FC<PoleadsProps> = ({ id }) => {
  const [poLeads, setPoLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  // Fetch leads
  useEffect(() => {
    if (!id) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/po-leads/by-po/${id}`
        );

        const leadsArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setPoLeads(leadsArray);
      } catch (err) {
        console.error("Error fetching PO leads:", err);
        setError("Failed to fetch PO leads");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [id]);

  // Handle update using PATCH
  const handleUpdate = async () => {
    if (!editingLead) return;

    if (
      !editingLead.platform ||
      !editingLead.mobileNumber ||
      editingLead.rate === undefined
    ) {
      alert("Please fill all fields before submitting");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setSuccess(false);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/po-leads/${editingLead.id}`,
        {
          platform: editingLead.platform,
          rate: editingLead.rate,
          mobileNumber: editingLead.mobileNumber,
        }
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);

      // Refresh leads
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/po-leads/by-po/${id}`
      );
      const leadsArray = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setPoLeads(leadsArray);

      setEditingLead(null);
    } catch (err) {
      console.error("Error updating lead:", err);
      setError("Failed to update lead");
    } finally {
      setUpdating(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Loading PO leads...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-6 flex items-center justify-center text-red-600">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  // Empty
  if (!Array.isArray(poLeads) || poLeads.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        No PO leads found.
      </div>
    );
  }

  return (
    <div className=" bg-white  border border-slate-200">
      {/* <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Leads from Chat
            </h3>
            <p className="text-sm text-slate-600">
              {poLeads.length} lead{poLeads.length !== 1 ? "s" : ""} via
              chatrace
            </p>
          </div>
        </div>
      </div> */}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 text-green-700 text-sm px-6 py-3 flex items-center gap-2 border-b border-green-200">
          <CheckCircle2 className="w-4 h-4" /> Lead updated successfully!
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                Mobile
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 uppercase">
                Platform
              </th>

              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 uppercase">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {poLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  {lead.user?.name || "N/A"}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                      lead.rate > 0
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {lead.rate > 0 ? `₹${lead.rate}` : "No Rate"}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      {new Date(lead.createdAt).toLocaleString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <a
                    href={`tel:${lead.mobileNumber}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {lead.mobileNumber}
                  </a>
                </td>

                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    {lead.platform || "Unknown"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setEditingLead(lead)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 ml-auto"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingLead && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Lead
              </h3>
              <button
                onClick={() => setEditingLead(null)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Platform
                </label>
                <input
                  type="text"
                  value={editingLead.platform}
                  onChange={(e) =>
                    setEditingLead({ ...editingLead, platform: e.target.value })
                  }
                  className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Rate
                </label>
                <input
                  type="number"
                  value={editingLead.rate}
                  onChange={(e) =>
                    setEditingLead({
                      ...editingLead,
                      rate: Number(e.target.value),
                    })
                  }
                  className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Mobile Number
                </label>
                <input
                  type="text"
                  value={editingLead.mobileNumber}
                  onChange={(e) =>
                    setEditingLead({
                      ...editingLead,
                      mobileNumber: e.target.value,
                    })
                  }
                  className="w-full mt-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Poleads;
