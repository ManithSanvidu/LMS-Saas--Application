"use client"

import * as React from "react"
import {
  type FieldPath,
  type FieldValues,
  type UseControllerReturn,
  type Control,
  type UseFormReturn,
  FormProvider,
  useController,
} from "react-hook-form"

import { cn } from "@/lib/utils"

function Form<TFieldValues extends FieldValues>({
  form,
  children,
  ...props
}: React.PropsWithChildren<{
  form: UseFormReturn<TFieldValues>
}> & React.ComponentPropsWithoutRef<"form">) {
  return (
    <FormProvider {...form}>
      <form {...props}>{children}</form>
    </FormProvider>
  )
}

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  control: Control<TFieldValues>
  name: TName
  render: (params: { field: UseControllerReturn<TFieldValues, TName>["field"] }) => React.ReactNode
}

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  render,
}: FormFieldProps<TFieldValues, TName>) {
  const { field } = useController<TFieldValues, TName>({ name, control })
  return <>{render({ field })}</>
}

function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium leading-none", className)} {...props} />
}

function FormControl({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full", className)} {...props} />
}

function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-destructive", className)} {...props}>
      {children}
    </p>
  )
}

export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage }
