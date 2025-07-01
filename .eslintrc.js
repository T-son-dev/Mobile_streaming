// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // Allow unused vars for development
    '@typescript-eslint/no-unused-vars': 'warn',
    // Allow unescaped entities in JSX
    'react/no-unescaped-entities': 'off',
  },
};
