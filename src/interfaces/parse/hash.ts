import { HashResult, validSHA256Digest } from "../../hash/hash";
import { expectObject, getProperty } from "./helpers";

export function validateHashResult(x: any): HashResult {
    const o = expectObject(x) as HashResult;
    const s = getProperty(o, "hexHashData", "string");
    if (!validSHA256Digest(s)) {
        throw new Error("Invalid digest in hash result");
    }
    return {
        hexHashData: s,
    };
}
