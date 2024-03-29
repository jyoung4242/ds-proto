const path = require("path");
const webpack = require("webpack");
const mode = process.env.NODE_ENV == "production" ? "production" : "development";
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
  entry: {
    index: path.resolve(__dirname, "./src/index.ts"),
  },
  output: {
    path: path.resolve(__dirname, "./build"),
    filename: "[name].bundle.js",
  },
  mode: mode,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]",
        },
      },
    ],
  },
  devtool: "inline-source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  devtool: "inline-source-map",
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./src/template.html"),
    }),
    new webpack.EnvironmentPlugin({
      COORDINATOR_HOST: "coordinator.hathora.com",
      MATCHMAKER_HOST: "matchmaker.hathora.com",
    }),
  ],
};
