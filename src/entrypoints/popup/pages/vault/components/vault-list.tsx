import { ItemGroup, ItemSeparator } from '@/components/ui/item';
import { VaultItem } from '@/entrypoints/popup/types';
import VaultListItem from './vault-item';

interface VaultListProps {
  items: VaultItem[];
}

export default function VaultList({ items }: VaultListProps) {
  return (
    // <div className="flex w-full max-w-md flex-col gap-6">
    <ItemGroup>
      {items.map((item, index) => (
        <>
          <VaultListItem key={item.id} item={item} />
          {index !== items.length - 1 && <ItemSeparator />}
        </>
      ))}
    </ItemGroup>
    // </div>
  );
}
