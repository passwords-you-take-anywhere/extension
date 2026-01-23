import { useLoaderData } from 'react-router';
import VaultForm from './components/vault-form';
import { VaultItem } from '@/types/vault';

export default function ViewPage() {
  const { item } = useLoaderData<{ item: VaultItem }>();

  return (
    <div className="">
      <VaultForm mode="view" item={item} />
    </div>
  );
}
