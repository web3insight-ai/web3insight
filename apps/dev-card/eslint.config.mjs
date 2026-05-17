import nextConfig from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Project uses `any` liberally at integration boundaries (oRPC handlers, snapshot APIs).
      '@typescript-eslint/no-explicit-any': 'off',
      // Animation hooks intentionally drive React state from interval/event callbacks.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
