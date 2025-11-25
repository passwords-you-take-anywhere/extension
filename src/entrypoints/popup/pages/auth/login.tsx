/* eslint-disable react/no-children-prop */
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';
import { useLogin } from '@/lib/query';
import { useNavigate } from 'react-router';

const formSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z
    .string()
    .nonempty('Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
});

export default function LoginPage() {
  const { mutate } = useLogin();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutate(value, {
        onSuccess: () => navigate('/'),
        onError: console.error,
      });
    },
  });

  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldSet className="gap-8">
        <Field className="text-center">
          <FieldLegend className="text-2xl font-bold tracking-tight">
            Welcome Back
          </FieldLegend>
          <FieldDescription className="text-muted-foreground">
            Enter credentials to access your <strong>Pyta</strong>
          </FieldDescription>
        </Field>

        <FieldGroup className="gap-5">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="pyta@pyta.com"
                    // autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    type="password"
                    placeholder="••••••••"
                    // autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <Field className="pt-3">
            <Button type="submit" size="lg" className="w-full font-semibold">
              Log In
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
