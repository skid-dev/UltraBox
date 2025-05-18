const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === "development"

    return {
        mode: isDevelopment ? "development" : "production",
        devtool: isDevelopment ? "cheap-module-source-map" : "source-map",

        entry: {
            popup: "./src/popup/popup.ts",
            background: "./src/background/background.ts",
            content: "./src/content/content.ts",
        },

        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "[name].js",
            clean: true,
        },

        resolve: {
            extensions: [".ts", ".js"],
        },

        module: {
            rules: [
                {
                    test: /\.(ts|js)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env", "@babel/preset-typescript"],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: "images/[hash][ext][query]",
                    },
                },
            ],
        },

        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/popup/popup.html",
                filename: "popup.html",
                chunks: ["popup"],
                inject: "body",
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: "src/manifest.json",
                        to: "manifest.json",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/icons",
                        to: "icons",
                        noErrorOnMissing: true,
                        globOptions: { ignore: ["**/.*"] },
                    },
                    {
                        from: "src/popup/styles.css",
                        to: "styles.css",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/content/inject.css",
                        to: "inject.css",
                        noErrorOnMissing: false,
                    },
                    {
                        from: "src/content/launcher_styles.css",
                        to: "launcher_styles.css",
                        noErrorOnMissing: false, 
                    }
                ],
            }),
        ],
    }
}
