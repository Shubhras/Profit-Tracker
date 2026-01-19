const CracoLessPlugin = require('craco-less');
const path = require('path');

// Import theme from CommonJS version
const { theme } = require('./src/config/theme/themeVariables.cjs');

module.exports = {
  webpack: {
    configure: {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
    },
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              ...theme,
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
