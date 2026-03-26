import { describe, it, expect } from "vitest";
import {
    isValidUsername,
    isValidPassword,
    isValidEmail,
    isNotEmpty,
    isWithinLength,
    safeInt,
} from "./validators";

describe("validators", () => {
    describe("isValidUsername", () => {
        it("accepts alphanumeric + underscore, 3-64 chars", () => {
            expect(isValidUsername("admin")).toBe(true);
            expect(isValidUsername("teacher_1")).toBe(true);
            expect(isValidUsername("abc")).toBe(true);
        });

        it("rejects too short", () => {
            expect(isValidUsername("ab")).toBe(false);
        });

        it("rejects special characters", () => {
            expect(isValidUsername("admin@school")).toBe(false);
            expect(isValidUsername("admin user")).toBe(false);
        });

        it("rejects empty", () => {
            expect(isValidUsername("")).toBe(false);
        });
    });

    describe("isValidPassword", () => {
        it("accepts 8+ chars with upper, lower, digit", () => {
            expect(isValidPassword("Admin123")).toBe(true);
            expect(isValidPassword("MyP4ssWord")).toBe(true);
        });

        it("rejects too short", () => {
            expect(isValidPassword("Ab1")).toBe(false);
        });

        it("rejects missing uppercase", () => {
            expect(isValidPassword("admin123")).toBe(false);
        });

        it("rejects missing lowercase", () => {
            expect(isValidPassword("ADMIN123")).toBe(false);
        });

        it("rejects missing digit", () => {
            expect(isValidPassword("AdminPass")).toBe(false);
        });
    });

    describe("isValidEmail", () => {
        it("accepts valid emails", () => {
            expect(isValidEmail("user@example.com")).toBe(true);
            expect(isValidEmail("a@b.co")).toBe(true);
        });

        it("rejects invalid emails", () => {
            expect(isValidEmail("not-an-email")).toBe(false);
            expect(isValidEmail("@missing.com")).toBe(false);
            expect(isValidEmail("missing@")).toBe(false);
        });
    });

    describe("isNotEmpty", () => {
        it("returns true for non-empty string", () => {
            expect(isNotEmpty("hello")).toBe(true);
        });

        it("returns false for empty/whitespace", () => {
            expect(isNotEmpty("")).toBe(false);
            expect(isNotEmpty("   ")).toBe(false);
        });
    });

    describe("isWithinLength", () => {
        it("checks range correctly", () => {
            expect(isWithinLength("abc", 1, 5)).toBe(true);
            expect(isWithinLength("abc", 5, 10)).toBe(false);
            expect(isWithinLength("abc", 1, 2)).toBe(false);
        });
    });

    describe("safeInt", () => {
        it("parses valid integers", () => {
            expect(safeInt("42")).toBe(42);
            expect(safeInt("0")).toBe(0);
        });

        it("returns fallback for invalid", () => {
            expect(safeInt("abc")).toBe(0);
            expect(safeInt("abc", -1)).toBe(-1);
        });
    });
});
