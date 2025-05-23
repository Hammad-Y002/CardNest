export default {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' }, modules: 'auto' }],
    ['@babel/preset-react', { runtime: 'automatic' }]
  ],
  plugins: [],
  // This ensures ES modules are handled properly
  sourceType: 'unambiguous',
  // Special handling for test environment
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ],
    }
  }
};

