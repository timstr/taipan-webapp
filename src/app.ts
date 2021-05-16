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
const HTTP_PORT = 80;

export interface SecureHTTPServer {
    server: https.Server;
    httpRedirectServer: http.Server;
    secure: true;
}

export interface InsecureHTTPServer {
    server: http.Server;
    secure: false;
}

export type HTTPServer = SecureHTTPServer | InsecureHTTPServer;

export class App {
    constructor(secure: boolean) {
        const publicRoot = getEnvironmentVariable("PUBLIC_ROOT", true);

        this.httpServer = secure
            ? App.makeSecureServer(publicRoot)
            : App.makeInsecureServer(publicRoot);

        this.gameServer = new GameServer(this.httpServer);

        this.onClose = new Emitter();
    }

    close() {
        console.log("Closing HTTP server");
        this.gameServer.close();
        this.httpServer.server.close();
        if (this.httpServer.secure) {
            this.httpServer.httpRedirectServer.close();
        }
        this.onClose.emit();
    }

    getGame(): Game {
        return this.gameServer.getGame();
    }

    private static makeSecureServer(publicRoot: string): SecureHTTPServer {
        const keyPath = getEnvironmentVariable("SECRET_KEY_PATH", true);
        const certPath = getEnvironmentVariable("SECRET_CERT_PATH", true);

        const options: https.ServerOptions = {
            key: fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath),
        };

        console.log(`HTTPS server serving files from ${publicRoot}`);

        const app = express();
        app.use(express.static(publicRoot));

        let httpsServer = https.createServer(options, app);
        httpsServer.listen(HTTPS_PORT);
        httpsServer.on("tlsClientError", (e) => {
            console.error("TLS Error!");
            console.error("    name: ", e.name);
            console.error(" message: ", e.message);
            console.error("   stack: ", e.stack);
        });
        console.log(`HTTPS server listening on port ${HTTPS_PORT}`);

        let httpRedirectServer = http.createServer({}, App.redirectToHTTPS);
        httpRedirectServer.listen(HTTP_PORT);
        console.log(`HTTP redirect server listening on port ${HTTP_PORT}`);

        return {
            server: httpsServer,
            httpRedirectServer: httpRedirectServer,
            secure: true,
        };
    }

    private static makeInsecureServer(publicRoot: string): InsecureHTTPServer {
        console.log(`HTTP server serving files from ${publicRoot}`);

        const app = express();
        app.use(express.static(publicRoot));

        let httpServer = http.createServer(app);
        httpServer.listen(HTTP_PORT);
        httpServer.on("tlsClientError", (e) => {
            console.error("TLS Error!");
            console.error("    name: ", e.name);
            console.error(" message: ", e.message);
            console.error("   stack: ", e.stack);
        });
        console.log(`HTTP server listening on port ${HTTP_PORT}`);

        return {
            server: httpServer,
            secure: false,
        };
    }

    private static redirectToHTTPS = (
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

    private httpServer: HTTPServer;
    private gameServer: GameServer;
}
