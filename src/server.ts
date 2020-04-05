import { GameServer } from "./gameserver";
import * as https from "https";
import * as node_static from "node-static";
import { Game } from "./interfaces/game/game";
import { Emitter } from "./interfaces/Emitter";
import * as fs from "fs";

const PORT = 443;

export class Server {
    constructor() {
        const getEnv = (name: string): string => {
            const val = process.env[name];
            if (typeof val !== "string") {
                console.error(`Please set the "${name}" environment variable`);
                throw new Error(`Missing environment variable "${name}"`);
            }
            return val;
        };

        const publicRoot = getEnv("PUBLIC_ROOT");

        const keyPath = getEnv("SECRET_KEY_PATH");
        const certPath = getEnv("SECRET_CERT_PATH");

        const options: https.ServerOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
            // TODO: consider using passphrase so friends need to know password
        };
        //const options: http.ServerOptions = {};

        const file = new node_static.Server(publicRoot);

        console.log(`HTTP server serving files from ${publicRoot}`);

        this.httpServer = https.createServer(options, (req, res) => {
            req.addListener("end", () => {
                file.serve(req, res);
            }).resume();
        });
        this.httpServer.listen(PORT);
        this.httpServer.on("tlsClientError", (e) => {
            console.error("TLS Error!");
            console.error("    name: ", e.name);
            console.error(" message: ", e.message);
            console.error("   stack: ", e.stack);
        });

        console.log(`HTTP server listening on port ${PORT}`);

        this.gameServer = new GameServer(this.httpServer);

        this.onClose = new Emitter();
    }

    // TODO: event listeners for http and game servers

    close() {
        console.log("Closing HTTP server");
        this.gameServer.close();
        this.httpServer.close();
        this.onClose.emit();
    }

    getGame(): Game {
        return this.gameServer.getGame();
    }

    onClose: Emitter<[]>;

    private httpServer: https.Server;
    private gameServer: GameServer;
}
