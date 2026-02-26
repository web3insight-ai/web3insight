"use client";

import { forwardRef } from "react";
import { Input, Select, SelectItem, Textarea } from "@/components/ui";
import {
  useFormContext,
  Controller,
  type FieldValues,
  type Path,
  type ControllerRenderProps,
} from "react-hook-form";

// ============================================================================
// Form Input Component
// ============================================================================

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "search";
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "flat" | "bordered" | "underlined" | "faded";
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  startContent,
  endContent,
  className,
  disabled,
  size = "md",
  variant = "bordered",
}: FormInputProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field,
        fieldState: { error },
      }: {
        field: ControllerRenderProps<T, Path<T>>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Input
          {...field}
          type={type}
          label={label}
          placeholder={placeholder}
          startContent={startContent}
          endContent={endContent}
          isInvalid={!!error}
          errorMessage={error?.message}
          className={className}
          isDisabled={disabled}
          size={size}
          variant={variant}
          classNames={{
            input: "text-sm font-normal",
            inputWrapper:
              "bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark",
          }}
        />
      )}
    />
  );
}

// ============================================================================
// Form Textarea Component
// ============================================================================

interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
}

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  placeholder,
  className,
  disabled,
  minRows = 3,
  maxRows = 6,
}: FormTextareaProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field,
        fieldState: { error },
      }: {
        field: ControllerRenderProps<T, Path<T>>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Textarea
          {...field}
          label={label}
          placeholder={placeholder}
          isInvalid={!!error}
          errorMessage={error?.message}
          className={className}
          isDisabled={disabled}
          minRows={minRows}
          maxRows={maxRows}
          classNames={{
            input: "text-sm font-normal",
            inputWrapper:
              "bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark",
          }}
        />
      )}
    />
  );
}

// ============================================================================
// Form Select Component
// ============================================================================

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  className,
  disabled,
  size = "md",
}: FormSelectProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({
        field,
        fieldState: { error },
      }: {
        field: ControllerRenderProps<T, Path<T>>;
        fieldState: { error?: { message?: string } };
      }) => (
        <Select
          {...field}
          label={label}
          placeholder={placeholder}
          selectedKeys={field.value ? [field.value] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0];
            field.onChange(selected);
          }}
          isInvalid={!!error}
          errorMessage={error?.message}
          className={className}
          isDisabled={disabled}
          size={size}
          classNames={{
            trigger:
              "bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark",
          }}
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      )}
    />
  );
}

// ============================================================================
// Form Error Message Component
// ============================================================================

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError = forwardRef<HTMLParagraphElement, FormErrorProps>(
  ({ message, className = "" }, ref) => {
    if (!message) return null;

    return (
      <p
        ref={ref}
        className={`text-xs text-danger mt-1 animate-fade-in ${className}`}
      >
        {message}
      </p>
    );
  },
);

FormError.displayName = "FormError";

// ============================================================================
// Form Submit Button Component
// ============================================================================

interface FormSubmitProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormSubmit({
  children,
  isLoading,
  disabled,
  className = "",
}: FormSubmitProps) {
  const { formState } = useFormContext();

  return (
    <button
      type="submit"
      disabled={disabled || isLoading || !formState.isValid}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all
        bg-primary text-white hover:bg-primary-600
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
