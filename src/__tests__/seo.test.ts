import { describe, expect, it } from "vitest";
import { unstable_getResponseFromNextConfig } from "next/experimental/testing/server";
import nextConfig from "../../next.config";
import { metadata as home } from "@/app/page";
import { metadata as browse } from "@/app/(app)/browse/page";
import { metadata as standards } from "@/app/(app)/browse/standards/layout";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("public search canonicals", () => {
  it("gives every public sitemap page its own apex canonical", () => {
    expect([home, browse, standards].map((m) => m.alternates?.canonical)).toEqual([
      "https://findamine.app/",
      "https://findamine.app/browse",
      "https://findamine.app/browse/standards",
    ]);
    expect(sitemap().map((entry) => entry.url)).toEqual(
      [home, browse, standards].map((m) => m.alternates?.canonical),
    );
  });

  it.each(["/", "/browse?q=science&audience=family", "/browse/standards?grade=3", "/login?next=%2Fdashboard"])(
    "permanently redirects www%s, preserving path and query",
    async (path) => {
      const response = await unstable_getResponseFromNextConfig({
        url: `https://www.findamine.app${path}`,
        nextConfig,
      });
      expect(response.status).toBe(308);
      expect(response.headers.get("location")).toBe(`https://findamine.app${path}`);
    },
  );

  it.each(["findamine.app", "localhost:3000", "findamine-preview.vercel.app", "wwwXfindamineXapp"])(
    "does not redirect %s",
    async (host) => {
      const response = await unstable_getResponseFromNextConfig({
        url: `https://${host}/browse?q=science`,
        nextConfig,
      });
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("keeps child profiles and authenticated pages out of the sitemap and crawler rules", () => {
    expect(sitemap().map((entry) => new URL(entry.url).pathname)).toEqual([
      "/", "/browse", "/browse/standards",
    ]);
    expect(robots().rules).toEqual(expect.arrayContaining([
      expect.objectContaining({ disallow: expect.arrayContaining(["/leaderboard", "/dashboard", "/admin", "/play"]) }),
    ]));
  });
});
