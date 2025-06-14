// D:/npm/mydocsai/rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';

export default [
  // Frontend Chatbot Component Bundle (index.js)
  {
    input: 'src/index.js', // Main frontend entry point
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named' // Add this line to resolve the warning
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named' // Add this line to resolve the warning
      }
    ],
    plugins: [
      peerDepsExternal(), // Excludes peer dependencies from the bundle
      resolve({
        browser: true // Ensures browser-compatible modules are resolved
      }),
      commonjs(), // Converts CommonJS modules to ES6
      postcss({
        extract: 'styles.css', // Extracts CSS to a separate file
        minimize: true,
        inject: false // Don't inject styles, let users import the CSS
      }),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env', '@babel/preset-react'], // Transpiles React JSX and modern JS
        babelHelpers: 'bundled'
      }),
      terser() // Minifies the output
    ],
    // IMPORTANT: 'framer-motion' is a dependency of DocsAIChatBot, so it should NOT be external here.
    // React and ReactDOM are peer dependencies.
    external: ['react', 'react-dom']
  },
  // Backend Utilities Bundle (backend.js)
  {
    input: 'src/backend.js', // NEW dedicated backend entry point
    output: [
      {
        file: 'dist/backend.js',
        format: 'cjs',
        sourcemap: true
      },
      {
        file: 'dist/backend.esm.js',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve({
        preferBuiltins: true // Prefer Node.js built-in modules for backend
      }),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/preset-env'], // Only env preset for backend (no React)
        babelHelpers: 'bundled'
      }),
      terser()
    ],
    // IMPORTANT: These should be external for the backend bundle.
    // 'next/server', 'stream', 'util', 'http' are Node.js built-ins or Next.js specific.
    // 'node-fetch' is a direct dependency that should be installed by the consumer.
    external: ['next/server', 'stream', 'util', 'http', 'node-fetch', 'stream/promises']
  }
];