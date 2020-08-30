import { GameServer } from "./gameserver";
import * as http from "http";
import * as https from "https";
import * as url from "url";
import { Game } from "./interfaces/game/game";
import { Emitter } from "./interfaces/emitter";
import * as express from "express";
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

        console.log(`HTTPS server serving files from ${publicRoot}`);

        const app = express();
        app.use(express.static(publicRoot));

        this.httpsServer = https.createServer(options, app);
        this.httpsServer.listen(HTTPS_PORT);
        this.httpsServer.on("tlsClientError", (e) => {
            console.error("TLS Error!");
            console.error("    name: ", e.name);
            console.error(" message: ", e.message);
            console.error("   stack: ", e.stack);
        });
        console.log(`HTTPS server listening on port ${HTTPS_PORT}`);

        this.httpRedirectServer = http.createServer({}, this.redirectToHTTPS);
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

    private redirectToHTTPS = (
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): void => {
        const theUrl = req.url ? url.parse(req.url) : null;
        const pathName = theUrl?.path || "";
        // NOTE: hostname appears to be null here, perhaps it is not visible
        // after the domain name is resolved to the server's IP address
        const redirectURL = new url.URL(
            pathName,
            "https://timstaipanserver.ca/"
        );
        res.writeHead(301, {
            Location: redirectURL.toString(),
        });
        res.end();
    };

    onClose: Emitter<[]>;

    private httpsServer: https.Server;
    private httpRedirectServer: http.Server;
    private gameServer: GameServer;
}
