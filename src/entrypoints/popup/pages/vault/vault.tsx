import { useState } from 'react';
import Search from './components/search';
import VaultList from './components/vault-list';
import { useLoaderData } from 'react-router';
import { VaultItem } from '../../types';

export default function VaultPage() {
  const [search, setSearch] = useState('');
  const { items } = useLoaderData<{ items: VaultItem[] }>();

  const filteredItems = items.filter((item) =>
    item.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      <Search value={search} onChange={setSearch} />
      <VaultList items={filteredItems} />
    </div>
  );
}
