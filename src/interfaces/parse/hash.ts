import { HashResult, validSHA256Digest } from "../../hash/hash";
import { expectObject, expectString, getProperty } from "./helpers";

export function validateHashResult(x: any): HashResult {
    const o = expectObject(x) as HashResult;
    const s = getProperty(o, "hexHashData", expectString);
    if (!validSHA256Digest(s)) {
        throw new Error("Invalid digest in hash result: \n" + s);
    }
    return {
        hexHashData: s,
    };
}
