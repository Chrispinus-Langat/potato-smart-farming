import { describe, expect, it } from "vitest";
import { buildFarmReportPdf } from "./report";

describe("farm PDF reports", () => {
  it("generates a PDF with farm activity and diagnosis sections", async () => {
    const pdf = await buildFarmReportPdf({
      farm: { name: "Kiamaina Farm", location: "Nyeri, Kenya", acreage: "2 acres" },
      fields: [{ name: "North field", variety: "Shangi", acreage: "1 acre", plantedAt: new Date("2026-08-12"), healthScore: 88 }],
      tasks: [{ title: "Scout field", description: "Check lower leaves", completed: false }],
      diagnoses: [{ diseaseName: "Late blight", confidence: 82, createdAt: new Date("2026-09-06"), symptoms: "Dark lesions" }],
    } as never);

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(500);
  });
});
