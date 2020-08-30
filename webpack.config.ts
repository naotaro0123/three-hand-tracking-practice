import { Rule, Module, Configuration as WebpackConfiguration } from 'webpack';
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import * as path from 'path';

// Reference Issue: 'devServer' does not exist in type 'Configuration'
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27570
interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

const rules: Rule[] = [
  {
    exclude: /node_modules/,
    test: /\.ts$/,
    use: 'ts-loader',
  },
  {
    test: /\.(frag|vert|glsl)$/,
    use: [
      {
        loader: 'webpack-glsl-loader',
        options: {},
      },
    ],
  },
];

const module: Module = {
  rules,
};

const config: Configuration = {
  mode: 'development',
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: `${__dirname}/dist`,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module,
  devServer: {
    contentBase: path.resolve(__dirname, './src'),
    watchContentBase: true,
    port: 4000,
    open: true,
    openPage: './index.html',
  },
};

export default config;
