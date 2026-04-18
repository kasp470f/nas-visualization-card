import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import { string } from 'rollup-plugin-string';

export default {
  input: 'src/nas-drive-card.ts',
  output: {
    file: 'dist/nas-drive-card.js',
    format: 'es',
    sourcemap: false
  },
  plugins: [
    string({ include: ['**/*.css'] }),
    typescript({ tsconfig: './tsconfig.json' }),
    terser()
  ]
};
