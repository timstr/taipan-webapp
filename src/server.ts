import { GameServer } from "./gameserver";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as node_static from "node-static";
import { Game } from "./interfaces/game/game";
import { Emitter } from "./interfaces/emitter";
import * as fs from "fs";
import { getEnvironmentVariable } from "./env";

const HTTPS_PORT = 443;
const HTTP_REDIRECT_PORT = 80;

export class Server {
    constructor() {
        const publicRoot = getEnvironmentVariable("PUBLIC_ROOT", true);
        const keyPath = getEnvironmentVariable("SECRET_KEY_PATH", true);
        const certPath = getEnvironmentVariable("SECRET_CERT_PATH", true);

        const options: https.ServerOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };

        const file = new node_static.Server(publicRoot);

        console.log(`HTTPS server serving files from ${publicRoot}`);

        this.httpsServer = https.createServer(options, (req, res) => {
            req.addListener("end", () => {
                file.serve(req, res);
            }).resume();
        });
        this.httpsServer.listen(HTTPS_PORT);
        this.httpsServer.on("tlsClientError", (e) => {
            console.error("TLS Error!");
            console.error("    name: ", e.name);
            console.error(" message: ", e.message);
            console.error("   stack: ", e.stack);
        });
        console.log(`HTTPS server listening on port ${HTTPS_PORT}`);

        this.httpRedirectServer = http.createServer({}, (req, res) => {
            const pathName = (req.url ? url.parse(req.url).pathname : "") || "";
            const redirectURL = new url.URL(
                pathName,
                "https://timstaipanserver.ca/"
            );
            res.writeHead(301, {
                Location: redirectURL.toString(),
            });
            res.end();
        });
        this.httpRedirectServer.listen(HTTP_REDIRECT_PORT);
        console.log(
            `HTTP redirect server listening on port ${HTTP_REDIRECT_PORT}`
        );

        this.gameServer = new GameServer(this.httpsServer);

        this.onClose = new Emitter();
    }

    close() {
        console.log("Closing HTTP server");
        this.gameServer.close();
        this.httpsServer.close();
        this.httpRedirectServer.close();
        this.onClose.emit();
    }

    getGame(): Game {
        return this.gameServer.getGame();
    }

    onClose: Emitter<[]>;

    private httpsServer: https.Server;
    private httpRedirectServer: http.Server;
    private gameServer: GameServer;
}
