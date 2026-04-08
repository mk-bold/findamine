"use client";

import { useState } from "react";
import Link from "next/link";
import { FEATURE_DEFINITIONS, FEATURE_WEIGHTS, getModelConfig } from "@/lib/ml/threat-config";

const config = getModelConfig();

const classColors: Record<string, string> = {
  safe: "bg-green-100 text-green-800 border-green-200",
  suspicious: "bg-yellow-100 text-yellow-800 border-yellow-200",
  likely_threat: "bg-orange-100 text-orange-800 border-orange-200",
  threat: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors: Record<string, string> = {
  "Location Integrity": "bg-blue-50 text-blue-700",
  "Gameplay Integrity": "bg-green-50 text-green-700",
  "Social Safety": "bg-purple-50 text-purple-700",
  "Account Security": "bg-orange-50 text-orange-700",
  "Infrastructure": "bg-gray-50 text-gray-700",
  "Child Safety": "bg-red-50 text-red-700",
  "Research Integrity": "bg-teal-50 text-teal-700",
};

export default function ModelPage() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = config.features.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return (
    <main className="mx-auto max-w-4xl px-4 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/admin/security" className="text-sm text-themed-primary hover:underline">&larr; Security</Link>
        <h1 className="text-lg font-semibold text-gray-900">Threat Detection Model</h1>
      </div>

      {/* Algorithm overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Algorithm Overview</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-800">Scoring Method</p>
            <p>{config.algorithm} with {config.hyperparameters.feature_count} features. Each feature is normalized to 0-1 and multiplied by its weight. The weighted sum is scaled to a 0-100 score.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Classification Thresholds</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(config.hyperparameters.classification_thresholds).map(([cls, range]) => (
                <span key={cls} className={`rounded-full border px-2 py-0.5 text-xs font-medium ${classColors[cls]}`}>
                  {cls.replace(/_/g, " ")}: {(range as number[])[0]}-{(range as number[])[1]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature detail popup */}
      {selectedFeature && FEATURE_DEFINITIONS[selectedFeature] && (
        <div className="rounded-lg border-2 border-sky-300 bg-sky-50 p-5 mb-6 relative">
          <button
            onClick={() => setSelectedFeature(null)}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label="Close"
          >
            &times;
          </button>
          <div className="flex items-start gap-3">
            <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${categoryColors[FEATURE_DEFINITIONS[selectedFeature].category] || "bg-gray-50 text-gray-700"}`}>
              {FEATURE_DEFINITIONS[selectedFeature].category}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">
                {FEATURE_DEFINITIONS[selectedFeature].label}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {FEATURE_DEFINITIONS[selectedFeature].description}
              </p>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span>Weight: <strong className="text-gray-800">{FEATURE_WEIGHTS[selectedFeature].weight}</strong></span>
                <span>Threshold: <strong className="text-gray-800">{FEATURE_WEIGHTS[selectedFeature].threshold}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features table */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Features</h2>
        <p className="text-xs text-gray-400 mb-3">Click any feature for a detailed definition.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2">Feature</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Weight</th>
                <th className="px-3 py-2 text-right">Threshold</th>
                <th className="px-3 py-2">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((f) => {
                const isSelected = selectedFeature === f.name;
                return (
                  <tr
                    key={f.name}
                    onClick={() => setSelectedFeature(isSelected ? null : f.name)}
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-sky-50" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-3 py-2">
                      <span className="text-sky-700 underline decoration-dotted font-medium">
                        {f.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded px-1.5 py-0.5 text-xs ${categoryColors[f.category] || "bg-gray-50 text-gray-700"}`}>
                        {f.category}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {f.weight > 0 ? "+" : ""}{f.weight}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-gray-500">
                      {f.threshold}
                    </td>
                    <td className="px-3 py-2">
                      <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${(Math.abs(f.weight) / 25) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explainability methods */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Explainability Methods</h2>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-gray-800 mb-1">Permutation Feature Importance (PFI)</p>
            <p className="text-xs">{config.explainability.global}</p>
            <p className="text-xs text-gray-400 mt-2">
              On the <Link href="/admin/security/threats" className="text-sky-600 underline">threats page</Link>, click any feature bar in the Global (PFI) chart to see its definition.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="font-semibold text-gray-800 mb-1">SHAP-like Marginal Contributions</p>
            <p className="text-xs">{config.explainability.local}</p>
            <p className="text-xs text-gray-400 mt-2">
              Expand any session in the <Link href="/admin/security/threats" className="text-sky-600 underline">threat labeler</Link> to see per-session SHAP contributions with clickable features.
            </p>
          </div>
        </div>
      </div>

      {/* DBSCAN clustering */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Threat Clustering (DBSCAN)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Algorithm</p>
            <p className="font-semibold text-gray-800">{config.clustering.algorithm}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Epsilon</p>
            <p className="font-semibold text-gray-800">{config.clustering.epsilon}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Min Points</p>
            <p className="font-semibold text-gray-800">{config.clustering.min_points}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Schedule</p>
            <p className="font-semibold text-gray-800 text-xs">{config.clustering.schedule}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          DBSCAN groups sessions into clusters in 15-dimensional feature space. Sessions in clusters with
          high average threat scores are auto-blocked for 7 days. Outlier sessions (noise) are scored individually.
          DBSCAN was chosen because it doesn&apos;t require pre-specifying the number of clusters and naturally
          identifies outliers, which is ideal when the number of attack groups is unknown.
        </p>
      </div>

      {/* Alternatives considered */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Why This Model?</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-800">Weighted Scoring vs. Random Forest</p>
            <p className="text-xs">Weighted scoring is fully transparent: every decision is traceable to specific feature contributions. Random Forests would require hundreds of labeled sessions to train and would be a black box.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Weighted Scoring vs. Neural Network</p>
            <p className="text-xs">Neural networks need thousands of training examples and provide no built-in explainability. Our model works with zero training data (weight-based) and improves as labels accumulate (PFI).</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">DBSCAN vs. K-Means</p>
            <p className="text-xs">K-Means requires specifying the number of clusters in advance and assumes spherical clusters. DBSCAN discovers clusters of arbitrary shape and automatically identifies noise points (isolated threats).</p>
          </div>
        </div>
      </div>
    </main>
  );
}
