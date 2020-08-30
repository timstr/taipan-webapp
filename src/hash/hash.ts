export interface HashResult {
    readonly hexHashData: string;
}

export function validSHA256Digest(s: string): boolean {
    return /^[0-9a-f]{64}$/.test(s);
}
