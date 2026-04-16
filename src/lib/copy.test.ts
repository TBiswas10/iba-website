import { getCopy } from "@/lib/copy";

describe("copy dictionaries", () => {
  it("returns english and bengali labels", () => {
    expect(getCopy("en").nav.events).toBe("Events");
    expect(getCopy("bn").nav.events).toBe("ইভেন্টস");
  });
});
