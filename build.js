const {build} = require('esbuild');

const buildOptions = {
  bundle: true,
  logLevel: 'info',
  minify: true,
  sourcemap: true,
  outdir: './js',
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
};

const entryPoint = './scripts/index.js';

build({
  ...buildOptions,
  format: 'esm',
  entryPoints: [entryPoint],
  entryNames: 'index',
});

build({
  ...buildOptions,
  format: 'cjs',
  entryPoints: [entryPoint],
  entryNames: `index-cjs`,
});
