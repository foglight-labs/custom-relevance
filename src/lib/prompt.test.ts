import { describe, expect, it } from "vitest";
import { bareItemName, buildInstructions } from "./prompt";

describe("bareItemName", () => {
  it("strips a leading national flag", () => {
    expect(bareItemName("🇦🇲 Yerevan")).toBe("Yerevan");
    expect(bareItemName("🇺🇸 San Francisco")).toBe("San Francisco");
  });

  it("strips a leading food or sport emoji", () => {
    expect(bareItemName("🍕 Pizza")).toBe("Pizza");
    expect(bareItemName("⚽ Football")).toBe("Football");
    expect(bareItemName("🥊 Boxing")).toBe("Boxing");
  });

  it("leaves an unprefixed name alone", () => {
    expect(bareItemName("Wikipedia")).toBe("Wikipedia");
    expect(bareItemName("Real Madrid")).toBe("Real Madrid");
    expect(bareItemName("X")).toBe("X");
  });
});

describe("buildInstructions", () => {
  it("fills the template with the bare item name", () => {
    expect(
      buildInstructions('Is this true of the city "{item}"? {factor}', "🇦🇲 Yerevan", "Cheap to live in"),
    ).toBe('Is this true of the city "Yerevan"? Cheap to live in');
  });
});
