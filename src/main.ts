import { App } from "./app";

async function run(secure: boolean) {
    return new Promise((resolve, reject) => {
        try {
            console.log("Starting server...");
            let app = new App(secure);
            app.onClose.addListener(resolve);
            console.log("Running...");
        } catch (e) {
            console.error("Error: ", e);
            reject(e);
        }
    });
}

let print_usage_and_exit = () => {
    console.log(`Usage: ${process.argv[0]} ${process.argv[1]} [--insecure]`);
    process.exit(0);
};

let secure = true;
const args = process.argv.slice(2);
if (args.length == 0) {
} else if (args.length == 1) {
    if (args[0] !== "--insecure") {
        print_usage_and_exit();
    }
    secure = false;
} else {
    print_usage_and_exit();
}

run(secure);
