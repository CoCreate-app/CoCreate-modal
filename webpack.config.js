const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { EsbuildPlugin } = require("esbuild-loader");
const { FileUploader } = require("@cocreate/webpack");

module.exports = async (env, argv) => {
	const isProduction = argv && argv.mode === "production";
	const config = {
		entry: {
			"CoCreate-modal": "./src/index.js"
		},
		output: {
			path: path.resolve(__dirname, "dist"),
			filename: isProduction ? "[name].min.js" : "[name].js",
			libraryExport: "default",
			library: ["CoCreate", "modal"],
			clean: true
		},
		plugins: [
			new MiniCssExtractPlugin({
				filename: isProduction ? "[name].min.css" : "[name].css"
			}),
			new FileUploader(env, argv)
		],
		mode: isProduction ? "production" : "development",
		devtool: isProduction ? "source-map" : "eval-source-map",
		module: {
			rules: [
				{
					test: /.js$/,
					exclude: /node_modules/,
					use: {
						loader: "esbuild-loader",
						options: {
							loader: "js",
							target: "es2017"
						}
					}
				},
				{
					test: /.css$/i,
					use: [MiniCssExtractPlugin.loader, "css-loader"]
				}
			]
		},
		optimization: {
			minimize: isProduction,
			minimizer: [
				new EsbuildPlugin({
					target: "es2017",
					css: true
				})
			],
			splitChunks: {
				cacheGroups: {
					defaultVendors: false
				}
			}
		},
		performance: {
			hints: isProduction ? "warning" : false
		}
	};
	return config;
};
