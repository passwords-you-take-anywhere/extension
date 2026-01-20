import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { VaultItem } from '@/entrypoints/popup/types';
import CopyDropdown from './copy-dropdown';
import { Link } from 'react-router';
import EditDropdown from './edit-dropdown';

interface VaultItemProps {
  item: VaultItem;
}

function renderText(username: string, maxLength = 20) {
  return username.length > maxLength
    ? `${username.slice(0, maxLength)}...`
    : username;
}

export default function VaultListItem({ item }: VaultItemProps) {
  return (
    <Item>
      {/* <ItemMedia>
        <Avatar className="rounded-md">
          <AvatarImage
            src={`https://avatar.vercel.sh/${item.username}`}
            className="grayscale"
          />
          <AvatarFallback>{item.username.charAt(0)}</AvatarFallback>
        </Avatar>
      </ItemMedia> */}
      <ItemContent className="gap-1">
        <Link to={`/vault/${item.id}`} viewTransition>
          <ItemTitle>{renderText(item.username)}</ItemTitle>
          <ItemDescription>
            {item.domains.map((d) => (
              <div key={d}>{renderText(d)}</div>
            ))}
          </ItemDescription>
        </Link>
      </ItemContent>
      <ItemActions>
        <CopyDropdown username={item.username} password={item.password} />
        <EditDropdown id={item.id} />
      </ItemActions>
    </Item>
  );
}
