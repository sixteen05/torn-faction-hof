import { OBFUSCATED_PASSCODE, PASSCODE } from "./CouncilUtil";

describe("PASSCODE obfuscation", () => {
  it("should correctly decode the obfuscated passcode to 'con-council'", () => {
    expect(PASSCODE).toBe("con-council");
  });

  it("should obfuscate correctly", () => {
    const obfuscate = (input: string): number[] => {
      return Array.from(input).map(char => {
        const ascii = char.charCodeAt(0);
        return (((ascii ^ 42) * 13) + 97) ^ 314;
      });
    };

    expect(obfuscate('con-council')).toEqual([
      1324, 728, 751, 390, 1324, 728, 1038, 751, 1324, 754, 725
    ]);
    expect(OBFUSCATED_PASSCODE).toEqual(obfuscate('con-council'));
  });

});
