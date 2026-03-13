import type { Configuration } from 'webpack';
import { DefinePlugin } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new DefinePlugin({
      __GAME_AREA_WS_ENDPOINT__: JSON.stringify(
        process.env.GAME_AREA_WS_ENDPOINT ?? '',
      ),
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
