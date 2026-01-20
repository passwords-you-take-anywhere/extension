import { useLoaderData } from 'react-router';
import VaultForm from './components/vault-form';
import { VaultItem } from '../../types';

export default function EditPage() {
  const { item } = useLoaderData<{ item: VaultItem }>();

  return (
    <div className="">
      <VaultForm mode="edit" item={item} />
    </div>
  );
}
