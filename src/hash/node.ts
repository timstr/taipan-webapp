import { HashResult } from "./hash";
import * as crypto from "crypto";
import { TextEncoder } from "util";

export async function hash(input: string): Promise<HashResult> {
    const enc = new TextEncoder();
    const inputBuff = enc.encode(input);
    const hashAlg = crypto.createHash("sha256");
    hashAlg.update(inputBuff);
    const hashHex = hashAlg.digest("hex");
    return {
        hexHashData: hashHex,
    };
}
