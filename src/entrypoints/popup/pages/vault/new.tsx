import { VaultItem } from '@/types/vault';
import VaultForm from './components/vault-form';
import { updateVault } from '@/lib/utils';

export default function NewPage() {
  return (
    <div className="">
      <VaultForm
        mode="new"
        onSubmit={(item) => {
          const newItem: VaultItem = {
            ...item,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            updated: new Date().toISOString(),
          };
          return updateVault(newItem);
        }}
      />
    </div>
  );
}
