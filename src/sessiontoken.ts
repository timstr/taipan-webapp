import * as crypto from "crypto";
import * as http from "http";

export const generateNewSessionToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
};

export const SESSION_TOKEN_COOKIE_NAME = "sessionToken";

const isSessionTokenValid = (token: string): boolean => {
    return /^[0-9a-f]{64}$/.test(token);
};

export const parseSessionToken = (
    headers: http.IncomingHttpHeaders
): string | null => {
    const cookies = headers.cookie;
    if (!cookies) {
        return null;
    }
    const tkEq = SESSION_TOKEN_COOKIE_NAME + "=";
    const i = cookies.indexOf(tkEq);
    if (i < 0) {
        return null;
    }
    const begin = i + tkEq.length;
    const j = cookies.indexOf(";", i);
    const end = j > 0 ? j : cookies.length;
    const maybeToken = cookies.substring(begin, end);
    return isSessionTokenValid(maybeToken) ? maybeToken : null;
};
