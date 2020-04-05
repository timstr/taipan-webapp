import { Server } from "./server";

async function run() {
    return new Promise((resolve, reject) => {
        try {
            console.log("Starting server...");
            let server = new Server();
            server.onClose.addListener(resolve);
            console.log("Running...");
        } catch (e) {
            console.error("Error: ", e);
            reject(e);
        }
    });
}

run();
