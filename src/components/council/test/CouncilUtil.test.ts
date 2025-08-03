import { OBFUSCATED_PASSCODE, passcodeEncoder } from "../CouncilUtil";

describe("PASSCODE obfuscation", () => {
  it("should obfuscate correctly", () => {
    expect(passcodeEncoder('con-council')).toEqual([
      1324, 728, 751, 390, 1324, 728, 1038, 751, 1324, 754, 725
    ]);
    expect(passcodeEncoder('con-council')).toEqual(OBFUSCATED_PASSCODE);
  });
});
