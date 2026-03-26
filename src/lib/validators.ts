export function isValidUsername(s: string): boolean {
    return /^[a-zA-Z0-9_]{3,64}$/.test(s);
}

export function isValidPassword(s: string): boolean {
    return (
        s.length >= 8 &&
        /[A-Z]/.test(s) &&
        /[a-z]/.test(s) &&
        /[0-9]/.test(s)
    );
}

export function isValidEmail(s: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isNotEmpty(s: string): boolean {
    return s.trim().length > 0;
}

export function isWithinLength(s: string, min: number, max: number): boolean {
    return s.length >= min && s.length <= max;
}

export function safeInt(s: string, fallback = 0): number {
    const n = parseInt(s, 10);
    return isNaN(n) ? fallback : n;
}
