import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { PlusIcon, SearchIcon } from 'lucide-react';
import { Link } from 'react-router';

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Search({ value, onChange }: SearchProps) {
  return (
    <div className="bg-background sticky top-0 z-10 flex gap-2 py-4">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          placeholder="Search vault..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </InputGroup>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange('')}
        style={{ viewTransitionName: 'back-add-button' }}
        asChild
      >
        <Link to="/vault/new" viewTransition>
          <PlusIcon />
        </Link>
      </Button>
    </div>
  );
}
