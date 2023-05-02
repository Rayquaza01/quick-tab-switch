/* eslint-disable */

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: {
        background: __dirname + "/src/background.ts",
        options: __dirname + "/src/options/index.ts",
        popup: __dirname + "/src/popup/index.ts"
    },
    devtool: "source-map",
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".tsx", ".js", ".jsx" ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin(),
        new HtmlWebpackPlugin({
            template: "src/options/options.html",
            filename: "options.html",
            chunks: ["options"],
        }),
        new HtmlWebpackPlugin({
            template: "src/popup/popup.html",
            filename: "popup.html",
            chunks: ["popup"],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "src/manifest.json" },
                {
                    from: "src/icons/",
                    to: "icons",
                    toType: "dir"
                },
                //{
                //    from: "src/_locales/",
                //    to: "_locales",
                //    toType: "dir"
                //},
                { from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js" },
                { from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js.map" }
            ]
        })
    ],
    optimization: {
        usedExports: true,
        minimizer: [
            new CssMinimizerWebpackPlugin(),
            new TerserWebpackPlugin()
        ]
    },
    externals: {
        "webextension-polyfill": "browser",
    }
}
