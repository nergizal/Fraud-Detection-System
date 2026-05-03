import React from "react";

export default function KPI({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}