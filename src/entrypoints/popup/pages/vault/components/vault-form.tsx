/* eslint-disable react/no-children-prop */
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { VaultItem } from '@/types/vault';
import { useForm } from '@tanstack/react-form';
import {
  ArrowLeftIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  PencilIcon,
  PlusIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

const formSchema = z.object({
  username_data: z.string().nonempty('Username is required.'),
  password_data: z.string().nonempty('Password is required.'),
  domains: z.array(z.string()),
  notes: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface VaultFormProps {
  mode: 'new' | 'edit' | 'view';
  item?: VaultItem;
  onSubmit?: (values: FormValues) => void;
}

export default function VaultForm({ mode, item, onSubmit }: VaultFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isViewMode = mode === 'view';
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username_data: item?.username_data ?? '',
      password_data: item?.password_data ?? '',
      domains: item?.domains ?? [''],
      notes: item?.notes ?? '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const cleanedValue = {
        ...value,
        domains: value.domains.filter((d) => d.trim() !== ''),
      };
      onSubmit?.(cleanedValue);
      navigate('/vault');
    },
  });

  const title = {
    new: 'Add New Item',
    edit: 'Edit Item',
    view: 'Item Details',
  }[mode];

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        if (!isViewMode) {
          form.handleSubmit();
        }
      }}
    >
      <div className="bg-background sticky top-0 z-10 flex items-center justify-between p-4">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            style={{ viewTransitionName: 'back-add-button' }}
          >
            <Link to=".." viewTransition>
              <ArrowLeftIcon />
            </Link>
          </Button>
          <FieldLegend className="my-auto text-2xl font-bold tracking-tight">
            {title}
          </FieldLegend>
        </div>
        {isViewMode ? (
          <Button size="icon" asChild>
            <Link to={`/vault/${item?.id}/edit`} viewTransition>
              <PencilIcon />
            </Link>
          </Button>
        ) : (
          <Button type="submit" size="icon">
            {mode === 'new' ? <PlusIcon /> : <CheckIcon />}
          </Button>
        )}
      </div>
      <FieldSet className="gap-6 px-4 pb-4">
        <FieldGroup className="gap-4">
          <form.Field
            name="username_data"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Enter username or email"
                    disabled={isViewMode}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="password_data"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      disabled={isViewMode}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <EyeIcon className="text-muted-foreground h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="domains"
            mode="array"
            children={(field) => (
              <Field>
                <FieldLabel>Domains</FieldLabel>
                <div className="flex flex-col gap-2">
                  {field.state.value.map((_, index) => (
                    <form.Field
                      key={index}
                      name={`domains[${index}]`}
                      children={(subField) => (
                        <div className="flex gap-2">
                          <Input
                            value={subField.state.value}
                            onBlur={subField.handleBlur}
                            onChange={(e) =>
                              subField.handleChange(e.target.value)
                            }
                            placeholder="example.com"
                            disabled={isViewMode}
                          />
                          {!isViewMode && field.state.value.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => field.removeValue(index)}
                            >
                              <XIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    />
                  ))}
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => field.pushValue('')}
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      Add Domain
                    </Button>
                  )}
                </div>
              </Field>
            )}
          />

          <form.Field
            name="notes"
            children={(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Notes</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Add any additional notes..."
                  disabled={isViewMode}
                  rows={3}
                />
              </Field>
            )}
          />
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
