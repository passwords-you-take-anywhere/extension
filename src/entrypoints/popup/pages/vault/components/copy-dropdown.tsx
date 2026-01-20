import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CopyIcon } from 'lucide-react';

async function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

interface CopyDropdownProps {
  username: string;
  password: string;
}

export default function CopyDropdown({
  username,
  password,
}: CopyDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <CopyIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => copyToClipboard(username)}>
          Username
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copyToClipboard(password)}>
          Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
