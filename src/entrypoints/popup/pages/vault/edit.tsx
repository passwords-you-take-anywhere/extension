import { useLoaderData } from 'react-router';
import VaultForm from './components/vault-form';
import { VaultItem } from '@/types/vault';
import { updateVault } from '@/lib/utils';

export default function EditPage() {
  const { item } = useLoaderData<{ item: VaultItem }>();

  return (
    <div className="">
      <VaultForm
        mode="edit"
        item={item}
        onSubmit={async (values) => {
          const mergedItem: VaultItem = {
            ...item,
            ...values,
            updated: new Date().toISOString(),
          };
          return updateVault(mergedItem);
        }}
      />
    </div>
  );
}
