import bcrypt from "bcryptjs";
import { jest } from '@jest/globals';
import { hashPassword, comparePassword } from "./authHelper"; 

describe("Password Utilities", () => {
  const plainPassword = "superSecret123!";

  it("hashPassword should return a hashed string that is not the same as the original password", async () => {
    const hashed = await hashPassword(plainPassword);

    expect(typeof hashed).toBe("string");
    expect(hashed).not.toBe(plainPassword);
    expect(hashed.startsWith("$2b$")).toBe(true);
  });

  it("comparePassword should return true for the correct password", async () => {
    const hashed = await hashPassword(plainPassword);

    const result = await comparePassword(plainPassword, hashed);
    expect(result).toBe(true);
  });

  it("comparePassword should return false for an incorrect password", async () => {
    const hashed = await hashPassword(plainPassword);

    const result = await comparePassword("wrongPassword!", hashed);
    expect(result).toBe(false);
  });

  it("hashPassword should use bcrypt.hash internally", async () => {
    const spy = jest.spyOn(bcrypt, "hash");

    await hashPassword(plainPassword);

    expect(spy).toHaveBeenCalledWith(plainPassword, 10);
    spy.mockRestore();
  });

  it("comparePassword should use bcrypt.compare internally", async () => {
    const spy = jest.spyOn(bcrypt, "compare");

    const hashed = await hashPassword(plainPassword);
    await comparePassword(plainPassword, hashed);

    expect(spy).toHaveBeenCalledWith(plainPassword, expect.any(String));
    spy.mockRestore();
  });
});

describe("hashPassword error handling", () => {
    it("should catch and log errors when bcrypt.hash throws", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      const error = new Error("hash failed");
      jest.spyOn(bcrypt, "hash").mockRejectedValueOnce(error);
  
      const result = await hashPassword("somePassword");
  
      expect(consoleSpy).toHaveBeenCalledWith(error);
      expect(result).toBeUndefined();
  
      consoleSpy.mockRestore();
    });
  });