"use client";

import React from "react";
import { DetectedEntity, EntityType } from "@/lib/detector";
import { ShieldCheck, Download, CheckCircle } from "lucide-react";

interface EntityTableProps {
  entities: DetectedEntity[];
  summaryReport: string;
  counts: Record<EntityType, number>;
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  onToggleEntity: (id: string) => void;
  hasScanned: boolean;
}

const TYPE_PILL_COLORS: Record<EntityType, string> = {
  NAME: "bg-amber-100 text-amber-800 border-amber-300",
  EMAIL: "bg-blue-100 text-blue-800 border-blue-300",
  PHONE: "bg-emerald-100 text-emerald-800 border-emerald-300",
  ID_NUMBER: "bg-purple-100 text-purple-800 border-purple-300",
  CREDIT_CARD: "bg-rose-100 text-rose-800 border-rose-300",
  SECRET: "bg-red-100 text-red-800 border-red-300",
  IP_ADDRESS: "bg-cyan-100 text-cyan-800 border-cyan-300",
};

export const EntityTable: React.FC<EntityTableProps> = ({
  entities,
  summaryReport,
  counts,
  selectedEntityId,
  onSelectEntity,
  onToggleEntity,
  hasScanned,
}) => {
  const handleExportJson = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: summaryReport,
      totalDetected: entities.length,
      counts,
      entities: entities.map((e) => ({
        id: e.id,
        type: e.type,
        value: e.value,
        location: { start: e.startIndex, end: e.endIndex },
        confidence: e.confidence,
        redactedAs: e.redactedValue,
        redacted: e.enabled,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `redaction-audit-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!hasScanned) {
    return null;
  }

  const isClean = entities.length === 0;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs space-y-0">
      {/* Summary Header */}
      <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            {isClean ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-zinc-900" />
            )}
            <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
              Inspection Report & Entity Registry
            </h2>
          </div>

          <p className="text-sm font-mono font-medium text-zinc-800 mt-1">
            {summaryReport}
          </p>
        </div>

        {!isClean && (
          <button
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md border border-zinc-200 hover:border-zinc-300 bg-white text-xs font-mono text-zinc-700 hover:bg-zinc-50 transition-all shadow-2xs self-start sm:self-auto"
            title="Download JSON Audit Trail"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export Audit JSON</span>
          </button>
        )}
      </div>

      {/* When Clean: Edge Case Display */}
      {isClean ? (
        <div className="p-8 text-center bg-white flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-zinc-900">
            No sensitive data found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Scanned the document across all detection patterns. Zero personal names,
            emails, phone numbers, or credentials were found.
          </p>
        </div>
      ) : (
        /* Entity Breakdown Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100/60 text-zinc-600 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Detected Value</th>
                <th className="py-2.5 px-4">Location Offset</th>
                <th className="py-2.5 px-4">Confidence</th>
                <th className="py-2.5 px-4">Redacted As</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {entities.map((entity) => {
                const isSelected = selectedEntityId === entity.id;
                const pillStyle =
                  TYPE_PILL_COLORS[entity.type] ||
                  "bg-zinc-100 text-zinc-800 border-zinc-300";

                return (
                  <tr
                    key={entity.id}
                    onClick={() => onSelectEntity(isSelected ? null : entity.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-zinc-100/90 font-medium"
                        : "hover:bg-zinc-50"
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${pillStyle}`}
                      >
                        {entity.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-900 font-medium">
                      {entity.value}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500">
                      chars [{entity.startIndex}..{entity.endIndex}]
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-12 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-zinc-800 h-full rounded-full"
                            style={{ width: `${entity.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-zinc-600">
                          {Math.round(entity.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-700">
                      <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-[11px] border border-zinc-200">
                        {entity.enabled ? entity.redactedValue || "[EMPTY]" : "[UNMASKED]"}
                      </code>
                    </td>
                    <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onToggleEntity(entity.id)}
                        className={`px-2 py-1 text-[10px] rounded font-mono border transition-all ${
                          entity.enabled
                            ? "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300"
                        }`}
                        title={entity.enabled ? "Click to keep original (unmask)" : "Click to redact"}
                      >
                        {entity.enabled ? "Redacting" : "Ignored"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
