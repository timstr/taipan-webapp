const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const mode =
    process.env.NODE_ENV === "production" ? "production" : "development";

console.log(`NOTE: building in ${mode} mode`);

let commonConfig = {
    context: path.resolve(__dirname, "src/"),

    mode,

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"],
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
        ],
    },
};

if (mode === "development") {
    // Enable sourcemaps for debugging webpack's output.
    commonConfig.devtool = "source-map";
}

const nodeConfig = {
    ...commonConfig,

    ...commonConfig,

    target: "node",

    node: {
        __dirname: false,
        __filename: false,
    },
};

const serverConfig = {
    ...nodeConfig,

    entry: {
        main: "./main.ts",
    },

    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist/server/"),
    },

    plugins: [new CleanWebpackPlugin()],
};

const hashPasswordConfig = {
    ...nodeConfig,

    entry: {
        main: "./hashpassword.ts",
    },

    output: {
        filename: "hashpassword.js",
        path: path.resolve(__dirname, "dist/util/"),
    },

    plugins: [new CleanWebpackPlugin()],
};

const clientConfig = {
    ...commonConfig,

    target: "web",

    entry: {
        index: "./index.tsx",
    },

    output: {
        filename: "index.js",
        path: path.resolve(__dirname, "dist/public/"),
    },

    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.
    externals: {
        react: "React",
        "react-dom": "ReactDOM",
    },

    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: "../static",
                    to: "static",
                },
                {
                    from: "../favicon.ico",
                    to: "favicon.ico",
                },
                {
                    from: `../index_${
                        mode === "production" ? "dist" : "dev"
                    }.html`,
                    to: "index.html",
                },
            ],
        }),
    ],
};

module.exports = [serverConfig, hashPasswordConfig, clientConfig];
