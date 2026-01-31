import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  imports: {
    eslintrc: {
      enabled: 9,
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    permissions: ['storage'],
    host_permissions: [
      '<all_urls>', // Allows the extension to interact with all websites
    ],
  },
});
