import { createNextConfig } from '@web3insight/next-config';

export default createNextConfig({
  overrides: {
    typescript: { ignoreBuildErrors: true },
  },
});
