"use client";

import { useState, useEffect } from "react";
import {
  PROFILE_FIELDS, VISIBILITY_LABELS, CATEGORIES,
  type VisibilityLevel, type PrivacyTreatment,
  getDefaults,
} from "@/lib/utils/privacy";

const VISIBILITY_LEVELS: VisibilityLevel[] = ["nobody", "team", "class", "everyone"];

export default function PrivacySettingsPage() {
  const [visibility, setVisibility] = useState<Record<string, VisibilityLevel>>({});
  const [treatment, setTreatment] = useState<PrivacyTreatment>("moderate");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ageBand, setAgeBand] = useState("intermediate");

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.user) {
          // Get treatment from metadata
          const t = data.user.metadata?.privacy_treatment || "moderate";
          setTreatment(t);

          // Get existing visibility or defaults
          const existing = data.user.profile_visibility || {};
          const defaults = getDefaults(ageBand);
          setVisibility({ ...defaults, ...existing });
        }
      })
      .catch(() => {});
  }, [ageBand]);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/v1/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_visibility: visibility }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function setFieldVisibility(key: string, level: VisibilityLevel) {
    setVisibility((prev) => ({ ...prev, [key]: level }));
    setSaved(false);
  }

  function setCategoryVisibility(category: string, level: VisibilityLevel) {
    const fields = PROFILE_FIELDS.filter((f) => f.category === category);
    setVisibility((prev) => {
      const next = { ...prev };
      fields.forEach((f) => { next[f.key] = level; });
      return next;
    });
    setSaved(false);
  }

  function setMasterVisibility(level: VisibilityLevel) {
    setVisibility((prev) => {
      const next = { ...prev };
      PROFILE_FIELDS.forEach((f) => { next[f.key] = level; });
      return next;
    });
    setSaved(false);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-4">
      <h1 className="text-base font-bold text-gray-900 mb-1">Privacy Settings</h1>
      <p className="text-xs text-gray-500 mb-4">
        Choose who can see different parts of your profile. You can change these anytime.
      </p>

      {/* Educational intro */}
      <div className="rounded-lg bg-sky-50 border border-sky-200 p-3 mb-4">
        <p className="text-xs text-sky-800">
          <strong>Why privacy matters:</strong> Your personal information belongs to you.
          These settings let you decide who sees what. There are no wrong answers — just
          think about what you're comfortable sharing with different groups of people.
        </p>
      </div>

      {/* SIMPLE treatment: one master toggle */}
      {treatment === "simple" && (
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-gray-700">Who can see your profile?</p>
          <div className="grid grid-cols-3 gap-2">
            {(["nobody", "team", "everyone"] as VisibilityLevel[]).map((level) => {
              const info = VISIBILITY_LABELS[level];
              const isActive = PROFILE_FIELDS.every((f) => visibility[f.key] === level);
              return (
                <button
                  key={level}
                  onClick={() => setMasterVisibility(level)}
                  className={`rounded-lg border p-3 text-center transition ${
                    isActive ? "border-sky-400 bg-sky-50 ring-2 ring-sky-200" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl block mb-1">{info.icon}</span>
                  <span className="text-xs font-medium text-gray-900">{info.label}</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">{info.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODERATE treatment: 3 categories × 3 levels */}
      {treatment === "moderate" && (
        <div className="space-y-4 mb-6">
          {CATEGORIES.map((cat) => {
            // Determine current category level (most common among fields)
            const fieldLevels = cat.fields.map((f) => visibility[f.key] || "nobody");
            const currentLevel = fieldLevels[0]; // simplified — use first field's level

            return (
              <div key={cat.key} className="rounded-lg border border-gray-200 p-3">
                <p className="text-sm font-medium text-gray-900 mb-1">{cat.label}</p>
                <p className="text-[11px] text-gray-500 mb-2">
                  {cat.fields.map((f) => f.label).join(", ")}
                </p>
                <div className="flex gap-1.5">
                  {(["nobody", "team", "everyone"] as VisibilityLevel[]).map((level) => {
                    const info = VISIBILITY_LABELS[level];
                    return (
                      <button
                        key={level}
                        onClick={() => setCategoryVisibility(cat.key, level)}
                        className={`flex-1 rounded px-2 py-1.5 text-[11px] transition ${
                          currentLevel === level
                            ? "bg-sky-100 text-sky-800 border border-sky-300"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {info.icon} {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* COMPLEX treatment: per-field × 4 levels */}
      {treatment === "complex" && (
        <div className="space-y-2 mb-6">
          {PROFILE_FIELDS.map((field) => (
            <div key={field.key} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs font-medium text-gray-900">{field.label}</p>
                  <p className="text-[10px] text-gray-500">{field.description}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-1.5">
                {VISIBILITY_LEVELS.map((level) => {
                  const info = VISIBILITY_LABELS[level];
                  return (
                    <button
                      key={level}
                      onClick={() => setFieldVisibility(field.key, level)}
                      className={`flex-1 rounded px-1.5 py-1 text-[10px] transition ${
                        visibility[field.key] === level
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {info.icon} {info.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-gray-400 mt-1 italic">{field.educationalTip}</p>
            </div>
          ))}
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Privacy Settings"}
        </button>
        {saved && <span className="text-xs text-green-600">Saved!</span>}
      </div>

      <p className="text-[10px] text-gray-400 mt-3">
        You can change these settings anytime from Settings → Privacy.
      </p>
    </main>
  );
}
