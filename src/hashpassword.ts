import * as readlineSync from "readline-sync";
import * as fs from "fs";
import { hash } from "./hash/node";

async function main() {
    const pwd = readlineSync
        .question("Please enter the new password:\n", { hideEchoBack: true })
        .trim();
    const pwdConf = readlineSync
        .question("Please confirm the password:\n", { hideEchoBack: true })
        .trim();
    if (pwd !== pwdConf) {
        console.error("The passwords do not match.");
        return -1;
    }

    const hashed = await hash(pwd);

    const outPath = (() => {
        const defaultPath = "pwd_hash.txt";
        const s = readlineSync
            .question(
                `Where should the password hash be saved? [${defaultPath}]:\n`
            )
            .trim();
        return s === "" ? defaultPath : s;
    })();

    fs.writeFileSync(outPath, hashed.hexHashData);

    return 0;
}

main();
