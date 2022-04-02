import type { RuleSetRule, Configuration } from 'webpack';

const rules: RuleSetRule[] = [
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

const config: Configuration = {
  mode: 'development',
  entry: {
    main: './src/index.ts',
  },
  output: {
    path: `${__dirname}/dist`,
  },
  module: {
    rules,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'eval-source-map',
};

export default config;
