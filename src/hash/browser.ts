import { HashResult } from "./hash";

export async function hash(input: string): Promise<HashResult> {
    const enc = new TextEncoder();
    const inputBuff = enc.encode(input);
    const hashBuff = await crypto.subtle.digest("SHA-256", inputBuff);
    const hashArr = Array.from(new Uint8Array(hashBuff));
    const toHexByte = (b: number) => b.toString(16).padStart(2, "0");
    const hashHex = hashArr.map(toHexByte).join("");
    return {
        hexHashData: hashHex,
    };
}
