import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  RectangleEllipsisIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MIN_LENGTH = 5;
const MAX_LENGTH = 128;
const DEFAULT_LENGTH = 14;

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SPECIAL = '!@#$%^&*';

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function randomInt(max: number) {
  if (max <= 0) {
    return 0;
  }

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function pickRandomChar(chars: string) {
  return chars[randomInt(chars.length)];
}

function shuffle(chars: string[]) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    [chars[index], chars[swapIndex]] = [chars[swapIndex], chars[index]];
  }

  return chars;
}

function generatePassword({
  length,
  includeUppercase,
  includeLowercase,
  includeNumbers,
  includeSpecial,
  minNumbers,
  minSpecial,
}: {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSpecial: boolean;
  minNumbers: number;
  minSpecial: number;
}) {
  if (length <= 0) {
    return '';
  }

  const pools: string[] = [];
  if (includeUppercase) {
    pools.push(UPPERCASE);
  }
  if (includeLowercase) {
    pools.push(LOWERCASE);
  }
  if (includeNumbers) {
    pools.push(NUMBERS);
  }
  if (includeSpecial) {
    pools.push(SPECIAL);
  }

  if (pools.length === 0) {
    return '';
  }

  const requiredNumbers = includeNumbers
    ? clampNumber(minNumbers, 0, length)
    : 0;
  const requiredSpecial = includeSpecial
    ? clampNumber(minSpecial, 0, length - requiredNumbers)
    : 0;

  if (requiredNumbers + requiredSpecial > length) {
    return '';
  }

  const passwordChars: string[] = [];
  for (let index = 0; index < requiredNumbers; index += 1) {
    passwordChars.push(pickRandomChar(NUMBERS));
  }
  for (let index = 0; index < requiredSpecial; index += 1) {
    passwordChars.push(pickRandomChar(SPECIAL));
  }

  const combined = pools.join('');
  for (let index = passwordChars.length; index < length; index += 1) {
    passwordChars.push(pickRandomChar(combined));
  }

  return shuffle(passwordChars).join('');
}

export default function GeneratorPage() {
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecial, setIncludeSpecial] = useState(true);
  const [minNumbers, setMinNumbers] = useState(1);
  const [minSpecial, setMinSpecial] = useState(0);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canGenerate = useMemo(
    () =>
      includeUppercase ||
      includeLowercase ||
      includeNumbers ||
      includeSpecial,
    [includeUppercase, includeLowercase, includeNumbers, includeSpecial]
  );

  useEffect(() => {
    setPassword(
      generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSpecial,
        minNumbers,
        minSpecial,
      })
    );
    setCopied(false);
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSpecial,
    minNumbers,
    minSpecial,
  ]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  function handleLengthChange(value: string) {
    const nextLength = clampNumber(
      Number.parseInt(value, 10),
      MIN_LENGTH,
      MAX_LENGTH
    );
    let nextMinNumbers = includeNumbers
      ? Math.min(minNumbers, nextLength)
      : 0;
    let nextMinSpecial = includeSpecial
      ? Math.min(minSpecial, nextLength - nextMinNumbers)
      : 0;

    if (!includeNumbers) {
      nextMinNumbers = 0;
    }
    if (!includeSpecial) {
      nextMinSpecial = 0;
    }

    setLength(nextLength);
    setMinNumbers(nextMinNumbers);
    setMinSpecial(nextMinSpecial);
  }

  function handleMinNumbersChange(value: string) {
    const maxAllowed = includeNumbers ? length - minSpecial : 0;
    const nextMinNumbers = clampNumber(Number.parseInt(value, 10), 0, maxAllowed);
    setMinNumbers(nextMinNumbers);
  }

  function handleMinSpecialChange(value: string) {
    const maxAllowed = includeSpecial ? length - minNumbers : 0;
    const nextMinSpecial = clampNumber(Number.parseInt(value, 10), 0, maxAllowed);
    setMinSpecial(nextMinSpecial);
  }

  function handleToggleNumbers(value: boolean) {
    setIncludeNumbers(value);
    if (!value) {
      setMinNumbers(0);
    }
  }

  function handleToggleSpecial(value: boolean) {
    setIncludeSpecial(value);
    if (!value) {
      setMinSpecial(0);
    }
  }

  function handleRegenerate() {
    setPassword(
      generatePassword({
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSpecial,
        minNumbers,
        minSpecial,
      })
    );
    setCopied(false);
  }

  async function handleCopy() {
    if (!password) {
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <FieldSet className="gap-5">
      <Field>
        <FieldLegend className="flex items-center gap-2 text-xl font-semibold">
          <RectangleEllipsisIcon className="text-muted-foreground" />
          Generator
        </FieldLegend>
      </Field>

      <div className="rounded-xl border bg-card/80 p-4 shadow-xs">
        <div className="relative">
          <Input
            readOnly
            value={password}
            className="pr-20 font-mono text-base"
            aria-label="Generated password"
            spellCheck={false}
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={handleRegenerate}
              disabled={!canGenerate}
              aria-label="Regenerate password"
            >
              <RefreshCwIcon />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              onClick={handleCopy}
              disabled={!password}
              aria-label={copied ? 'Copied' : 'Copy password'}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
            </Button>
          </div>
        </div>
      </div>

      <FieldSet className="gap-4">
        <FieldLegend className="text-sm font-semibold text-muted-foreground uppercase">
          Options
        </FieldLegend>

        <div className="rounded-xl border bg-card/80 p-4 shadow-xs">
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="password-length">Length</FieldLabel>
              <Input
                id="password-length"
                type="number"
                min={MIN_LENGTH}
                max={MAX_LENGTH}
                value={length}
                onChange={(event) => handleLengthChange(event.target.value)}
              />
              <FieldDescription>
                Value must be between {MIN_LENGTH} and {MAX_LENGTH}. Use 14
                characters or more to generate a strong password.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </div>

        <div className="rounded-xl border bg-card/80 p-4 shadow-xs">
          <FieldTitle>Include</FieldTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Label className="gap-2 font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input bg-background text-primary accent-primary"
                checked={includeUppercase}
                onChange={(event) => setIncludeUppercase(event.target.checked)}
              />
              A-Z
            </Label>
            <Label className="gap-2 font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input bg-background text-primary accent-primary"
                checked={includeLowercase}
                onChange={(event) => setIncludeLowercase(event.target.checked)}
              />
              a-z
            </Label>
            <Label className="gap-2 font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input bg-background text-primary accent-primary"
                checked={includeNumbers}
                onChange={(event) => handleToggleNumbers(event.target.checked)}
              />
              0-9
            </Label>
            <Label className="gap-2 font-medium">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border border-input bg-background text-primary accent-primary"
                checked={includeSpecial}
                onChange={(event) => handleToggleSpecial(event.target.checked)}
              />
              !@#$%^&*
            </Label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="min-numbers">Minimum numbers</FieldLabel>
              <Input
                id="min-numbers"
                type="number"
                min={0}
                max={includeNumbers ? length - minSpecial : 0}
                value={minNumbers}
                disabled={!includeNumbers}
                onChange={(event) => handleMinNumbersChange(event.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="min-special">Minimum special</FieldLabel>
              <Input
                id="min-special"
                type="number"
                min={0}
                max={includeSpecial ? length - minNumbers : 0}
                value={minSpecial}
                disabled={!includeSpecial}
                onChange={(event) => handleMinSpecialChange(event.target.value)}
              />
            </Field>
          </div>

          {!canGenerate && (
            <FieldDescription className="mt-3 text-destructive">
              Select at least one character set to generate a password.
            </FieldDescription>
          )}
        </div>
      </FieldSet>
    </FieldSet>
  );
}
