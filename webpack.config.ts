import { Rule, Module, Configuration } from 'webpack';
import * as path from 'path';

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
