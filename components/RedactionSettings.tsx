"use client";

import React from "react";
import { RedactionConfig, RedactionStyle, EntityType } from "@/lib/detector";
import { SlidersHorizontal, Eye, Shield, Hash, Shuffle, Trash2 } from "lucide-react";

interface RedactionSettingsProps {
  config: RedactionConfig;
  onChange: (newConfig: RedactionConfig) => void;
  entityCounts: Record<EntityType, number>;
}

export const RedactionSettings: React.FC<RedactionSettingsProps> = ({
  config,
  onChange,
  entityCounts,
}) => {
  const styles: Array<{
    id: RedactionStyle;
    label: string;
    example: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "tag",
      label: "Tag Token",
      example: "[NAME], [EMAIL]",
      icon: <Eye className="w-3.5 h-3.5" />,
    },
    {
      id: "mask",
      label: "Mask Bullets",
      example: "••••••••",
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      id: "hash",
      label: "Crypto Pseudonym",
      example: "[#9f2c3a]",
      icon: <Hash className="w-3.5 h-3.5" />,
    },
    {
      id: "synthetic",
      label: "Synthetic Faker",
      example: "Alex Morgan",
      icon: <Shuffle className="w-3.5 h-3.5" />,
    },
    {
      id: "remove",
      label: "Remove",
      example: "Empty string",
      icon: <Trash2 className="w-3.5 h-3.5" />,
    },
  ];

  const entityTypeLabels: Record<EntityType, { label: string; tag: string }> = {
    NAME: { label: "Full Names", tag: "NAME" },
    EMAIL: { label: "Email Addresses", tag: "EMAIL" },
    PHONE: { label: "Phone Numbers", tag: "PHONE" },
    ID_NUMBER: { label: "Govt IDs (PAN/Aadhaar/SSN)", tag: "ID" },
    CREDIT_CARD: { label: "Credit Cards", tag: "CARD" },
    SECRET: { label: "API Keys & Tokens", tag: "SECRET" },
    IP_ADDRESS: { label: "IP Addresses", tag: "IP" },
  };

  const handleStyleChange = (style: RedactionStyle) => {
    onChange({ ...config, style });
  };

  const handleTypeToggle = (type: EntityType) => {
    onChange({
      ...config,
      enabledTypes: {
        ...config.enabledTypes,
        [type]: !config.enabledTypes[type],
      },
    });
  };

  const handleConfidenceChange = (val: number) => {
    onChange({
      ...config,
      confidenceThreshold: val,
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-zinc-700" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
            Redaction Rules & Configuration
          </h2>
        </div>

        <div className="flex items-center space-x-2 text-xs text-zinc-500">
          <span>Confidence Threshold:</span>
          <span className="font-mono font-medium text-zinc-900">
            {Math.round(config.confidenceThreshold * 100)}%
          </span>
          <input
            type="range"
            min="0.4"
            max="0.95"
            step="0.05"
            value={config.confidenceThreshold}
            onChange={(e) => handleConfidenceChange(parseFloat(e.target.value))}
            className="w-24 accent-zinc-900 cursor-pointer"
          />
        </div>
      </div>

      {/* Redaction Style Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
          Masking Strategy
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {styles.map((s) => {
            const isSelected = config.style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleStyleChange(s.id)}
                className={`flex flex-col text-left p-2.5 rounded-lg border transition-all text-xs ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                    : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/60 text-zinc-700"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium mb-1">
                  <span>{s.icon}</span>
                  <span className="truncate">{s.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono truncate ${
                    isSelected ? "text-zinc-300" : "text-zinc-400"
                  }`}
                >
                  {s.example}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entity Filters */}
      <div className="space-y-2 pt-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block">
          Entity Types to Redact
        </label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(entityTypeLabels) as EntityType[]).map((type) => {
            const isEnabled = config.enabledTypes[type] !== false;
            const count = entityCounts[type] || 0;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeToggle(type)}
                className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition-all border ${
                  isEnabled
                    ? "bg-zinc-100 border-zinc-300 text-zinc-900 font-medium"
                    : "bg-white border-zinc-200 text-zinc-400 line-through opacity-60"
                }`}
              >
                <span>{entityTypeLabels[type].label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isEnabled
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-200 text-zinc-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
