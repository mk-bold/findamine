import { describe, it, expect } from "vitest";
import {
  assignCondition,
  getCondition,
  hasScaffolding,
  hasFeedback,
} from "@/lib/utils/experiment";

describe("Experiment Assignment", () => {
  it("assigns a valid condition for any user ID", () => {
    const validConditions = ["control", "scaffolding", "feedback", "full"];
    for (const uid of ["user-1", "user-2", "abc-123", "test@email.com", ""]) {
      expect(validConditions).toContain(assignCondition(uid));
    }
  });

  it("assigns consistently (same ID → same condition)", () => {
    const id = "test-user-abc";
    const first = assignCondition(id);
    const second = assignCondition(id);
    expect(first).toBe(second);
  });

  it("distributes across all 4 conditions", () => {
    const conditions = new Set<string>();
    // Try many IDs to hit all 4 conditions
    for (let i = 0; i < 100; i++) {
      conditions.add(assignCondition(`user-${i}`));
    }
    expect(conditions.size).toBe(4);
  });
});

describe("getCondition", () => {
  it("returns stored condition from metadata", () => {
    const metadata = { experiment_condition: "full" };
    expect(getCondition(metadata, "user-1")).toBe("full");
  });

  it("assigns condition when metadata is null", () => {
    const result = getCondition(null, "user-1");
    expect(["control", "scaffolding", "feedback", "full"]).toContain(result);
  });

  it("assigns condition when metadata has no experiment_condition", () => {
    const result = getCondition({ other_field: true }, "user-1");
    expect(["control", "scaffolding", "feedback", "full"]).toContain(result);
  });
});

describe("Feature flags", () => {
  it("hasScaffolding returns true for scaffolding and full", () => {
    expect(hasScaffolding("scaffolding")).toBe(true);
    expect(hasScaffolding("full")).toBe(true);
    expect(hasScaffolding("control")).toBe(false);
    expect(hasScaffolding("feedback")).toBe(false);
  });

  it("hasFeedback returns true for feedback and full", () => {
    expect(hasFeedback("feedback")).toBe(true);
    expect(hasFeedback("full")).toBe(true);
    expect(hasFeedback("control")).toBe(false);
    expect(hasFeedback("scaffolding")).toBe(false);
  });
});
