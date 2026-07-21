const path = require('path');

module.exports = {
  test: {
    include: ['test/**/*.test.ts'],
    resolve: {
      alias: {
        '@lucas-contrial/core': path.resolve(__dirname, '../../core/dist/index.js'),
      }
    }
  }
};