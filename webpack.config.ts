import { WebpackConfiguration } from "webpack-cli";
import path from "path";
import CopyPlugin from "copy-webpack-plugin";


let mode: WebpackConfiguration["mode"];
const NODE_ENV = process.env.NODE_ENV?.trim().toLowerCase() || null;

switch (NODE_ENV) {
    case "production":
    case "development":
    case "none":
        mode = process.env.NODE_ENV as WebpackConfiguration["mode"];
        break;
    case null:
        mode = "development";
        break;
    default:
        throw new Error(`Unknown NODE_ENV '${ process.env.NODE_ENV }'`);
}

const config: WebpackConfiguration = {
    target: "web",
    entry: path.resolve(__dirname, "src", "main.ts"),
    output: {
        path: path.join(__dirname, "dist"),
    },
    mode,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
            },
            {
                test: /\.s?css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
        ],
    },
    resolve: {
        extensions: [ ".js", ".ts", ".jsx", ".tsx" ],
        fallback: { "path": require.resolve("path-browserify") },
    },
    externals: {
        "react": "React",
        "react-dom": "ReactDOM",
        "@material-ui/core": "MaterialUI",
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: path.join(__dirname, "src", "index.html"), to: "index.html" },
            ],
        }),
    ],
};

export default config;

