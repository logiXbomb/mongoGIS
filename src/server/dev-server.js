import webpack from 'webpack';
import webpackConfig from './../../webpack.config.js';
import WebpackDevServer from 'webpack-dev-server';
import winston from 'winston';

const devServer = () => {
  let bundleStart = null;
  const compiler = webpack(webpackConfig);

  compiler.plugin('compile', () => {
    winston.info('Bundling...');
    bundleStart = Date.now();
  });

  compiler.plugin('done', () => {
    winston.info(`Bundled in ${Date.now() - bundleStart} ms!`);
  });

  const bundler = new WebpackDevServer(compiler, {
    publicPath: '/dist/',
    hot: true,
    quiet: false,
    noInfo: true,
    stats: {
      colors: true,
    },
  });

  bundler.listen(8080, 'localhost', () => {
    winston.info('Bundling project, please wait...');
  });
};

export default devServer;
