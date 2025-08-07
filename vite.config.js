import { defineConfig } from 'vite';

export default defineConfig({
  base: '/fuzzy-octo/',
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment'
  }
});
