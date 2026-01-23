import { useState } from 'react';
import Search from './components/search';
import VaultList from './components/vault-list';
import { VaultItem } from '@/types/vault';
import { useSync } from '@/lib/query/sync';
import { VaultListSkeleton } from '@/components/ui/skeleton';

function filterItems(items: VaultItem[], search: string) {
  if (search.trim() === '') {
    return items;
  }
  return items.filter(
    (item) =>
      item.domains.some((domain) => domain.includes(search)) ||
      item.username_data.includes(search)
  );
}

export default function VaultPage() {
  const [search, setSearch] = useState('');
  const { data, isSuccess, isError } = useSync();

  if (isError) {
    return <div className="text-red-500">Error syncing vault data.</div>;
  }

  return (
    <div className="flex flex-col">
      <Search value={search} onChange={setSearch} />
      {isSuccess ? (
        <VaultList items={filterItems(data, search)} />
      ) : (
        <VaultListSkeleton />
      )}
    </div>
  );
}
