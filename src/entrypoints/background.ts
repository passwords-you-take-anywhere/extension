import { VAULT_KEY_STORAGE_KEY } from '@/const';
import { syncVault } from '@/lib/query/sync';

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });
  setInterval(async () => {
    console.log('Syncing vault...');
    if (!(await storage.getItem(VAULT_KEY_STORAGE_KEY))) {
      console.log('No vault key found, skipping sync.');
      return;
    }
    syncVault();
  }, 1000 * 60); // every 1 minute
});
