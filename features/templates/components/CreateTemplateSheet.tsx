"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { useCreateTemplate } from "@/features/templates/hooks/useCreateTemplate";
import { t } from "@/utils/t";
import { PlusIcon } from "lucide-react";

const schema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(998),
  fromName: z.string().min(1).max(255),
  replyTo: z
    .string()
    .email()
    .optional()
    .or(z.literal("")),
  preheader: z.string().max(255).optional(),
  mjml: z.string().min(1).max(500_000),
});

type FormValues = z.infer<typeof schema>;

export function CreateTemplateSheet() {
  const [open, setOpen] = useState(false);
  const { mutate: createTemplate, isPending } = useCreateTemplate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    createTemplate(
      {
        name: data.name,
        subject: data.subject,
        fromName: data.fromName,
        replyTo: data.replyTo || undefined,
        preheader: data.preheader || undefined,
        mjml: data.mjml,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      }
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button />}
      >
        <PlusIcon data-icon="inline-start" />
        {t("templates.newTemplate")}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("templates.create.title")}</SheetTitle>
          <SheetDescription>{t("templates.create.description")}</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 p-4">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">{t("templates.create.fields.name")}</FieldLabel>
              <Input
                id="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.subject}>
              <FieldLabel htmlFor="subject">{t("templates.create.fields.subject")}</FieldLabel>
              <Input
                id="subject"
                aria-invalid={!!errors.subject}
                {...register("subject")}
              />
              {errors.subject && <FieldError>{errors.subject.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.fromName}>
              <FieldLabel htmlFor="fromName">{t("templates.create.fields.fromName")}</FieldLabel>
              <Input
                id="fromName"
                aria-invalid={!!errors.fromName}
                {...register("fromName")}
              />
              {errors.fromName && <FieldError>{errors.fromName.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.replyTo}>
              <FieldLabel htmlFor="replyTo">{t("templates.create.fields.replyTo")}</FieldLabel>
              <Input
                id="replyTo"
                type="email"
                aria-invalid={!!errors.replyTo}
                {...register("replyTo")}
              />
              {errors.replyTo && <FieldError>{errors.replyTo.message}</FieldError>}
              <FieldDescription>Optional</FieldDescription>
            </Field>

            <Field data-invalid={!!errors.preheader}>
              <FieldLabel htmlFor="preheader">{t("templates.create.fields.preheader")}</FieldLabel>
              <Input
                id="preheader"
                aria-invalid={!!errors.preheader}
                {...register("preheader")}
              />
              {errors.preheader && <FieldError>{errors.preheader.message}</FieldError>}
              <FieldDescription>Optional — short preview text shown in email clients.</FieldDescription>
            </Field>

            <Field data-invalid={!!errors.mjml}>
              <FieldLabel htmlFor="mjml">{t("templates.create.fields.mjml")}</FieldLabel>
              <Textarea
                id="mjml"
                rows={12}
                className="font-mono text-xs"
                aria-invalid={!!errors.mjml}
                {...register("mjml")}
              />
              {errors.mjml && <FieldError>{errors.mjml.message}</FieldError>}
            </Field>
          </FieldGroup>

          <SheetFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner data-icon="inline-start" />}
              {isPending ? t("templates.create.submitting") : t("templates.create.submit")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
