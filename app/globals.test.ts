import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const globalCss = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");

const universalBoxSizingRules = [...globalCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter(([, selector, declarations]) => {
    const usesUniversalSelector = selector
      .split(",")
      .some((part) => /^\*($|::)/.test(part.trim()));

    return usesUniversalSelector && /\bbox-sizing\s*:/.test(declarations);
  })
  .map(([, selector]) => selector.trim());

describe("global CSS safety", () => {
  it("leaves input box sizing to MUI CssBaseline", () => {
    expect(universalBoxSizingRules).toEqual([]);
  });
});
