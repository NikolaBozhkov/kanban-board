const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const path = require('path');
const spawn = require('cross-spawn');
const webpackConfigClient = require('./webpack.config.client');
const webpackConfigServer = require('./webpack.config.server');

const devConfigClient = {
  ...webpackConfigClient,
  mode: 'development',
  devtool: 'source-map',
  output: {
    ...webpackConfigClient.output,
    filename: '[name].js'
  },
};

const clientDevServerOptions = {
  contentBase: path.join(__dirname, 'dist'),
  hot: true,
  historyApiFallback: true,
};

webpackDevServer.addDevServerEntrypoints(devConfigClient, clientDevServerOptions);
const clientCompiler = webpack(devConfigClient);
const clientDevServer = new webpackDevServer(clientCompiler, clientDevServerOptions);

clientDevServer.listen(5000, 'localhost');

const serverCompiler = webpack({
  ...webpackConfigServer,
  mode: 'development',
  devtool: 'source-map',
  },
);

let node;

serverCompiler.hooks.watchRun.tap('Dev', (compiler) => {
  console.log(`Compiling ${compiler.name} ...`);
  if (compiler.name === 'server' && node) {
    node.kill();
    node = undefined;
  }
});

serverCompiler.watch({}, (err, stats) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(stats?.toString('minimal'));
  const compiledSuccessfully = !stats?.hasErrors();
  if (compiledSuccessfully && !node) {
    console.log('Starting Node.js ...');
    node = spawn(
      'node',
      [path.join(__dirname, 'dist/server.js')],
      {
        stdio: 'inherit',
      }
    );
  }
});