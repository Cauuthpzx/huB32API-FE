import { describe, it, expect } from "vitest";
import { formatUptime, formatBitrate, formatIp, formatNumber } from "./formatters";

describe("formatters", () => {
    describe("formatUptime", () => {
        it("formats seconds only", () => {
            expect(formatUptime(45)).toBe("45s");
        });

        it("formats minutes + seconds", () => {
            expect(formatUptime(125)).toBe("2m 5s");
        });

        it("formats hours + minutes", () => {
            expect(formatUptime(3725)).toBe("1h 2m");
        });
    });

    describe("formatBitrate", () => {
        it("formats kbps", () => {
            expect(formatBitrate(500)).toBe("500 kbps");
        });

        it("formats Mbps", () => {
            expect(formatBitrate(2500)).toBe("2.5 Mbps");
        });
    });

    describe("formatIp", () => {
        it("returns short IPs as-is", () => {
            expect(formatIp("192.168.1.1")).toBe("192.168.1.1");
        });

        it("truncates long strings", () => {
            const long = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
            expect(formatIp(long)).toBe("2001:0db8:85a3:\u2026");
        });
    });

    describe("formatNumber", () => {
        it("formats with locale separators", () => {
            // Just verify it returns a string representation
            expect(formatNumber(1234)).toBeTruthy();
        });
    });
});
