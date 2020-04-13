export interface HashResult {
    readonly hexHashData: string;
}

export function validSHA256Digest(s: string): boolean {
    return /[0-9a-f]{32}/.test(s);
}
