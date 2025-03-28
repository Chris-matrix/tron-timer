// eslint.config.js
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        document: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        console: 'readonly',
        React: 'writable',
        ReactDOM: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        Audio: 'readonly',
        Notification: 'readonly'
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      // React specific rules
      'react/prop-types': 'warn',
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General JavaScript rules
      'no-unused-vars': ['warn', { 
        "varsIgnorePattern": "React|styled|^_|Provider$|^[A-Z]", 
        "argsIgnorePattern": "^_" 
      }],
      'no-console': 'off', // Allow console for development
      'no-undef': 'error',
      'prefer-const': 'warn',
    }
  }
];
