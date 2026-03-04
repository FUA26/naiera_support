"use client";

import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { FormField } from "./form-field";

interface InputFieldProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  disabled?: boolean;
}

export function InputField({
  name,
  label,
  description,
  placeholder,
  required,
  type = "text",
  disabled = false,
}: InputFieldProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      label={label}
      description={description}
      required={required}
      render={({ field }) => (
        <Input {...field} type={type} placeholder={placeholder} disabled={disabled} />
      )}
    />
  );
}
