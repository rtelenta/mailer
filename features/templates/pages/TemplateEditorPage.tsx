"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import Handlebars from "handlebars";
import mjml from "mjml-browser";
import { ArrowLeftIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { TemplatePreviewPane } from "@/features/templates/components/TemplatePreviewPane";
import { ShareTemplateSheet } from "@/features/templates/components/ShareTemplateSheet";
import { useTemplate } from "@/features/templates/hooks/useTemplate";
import { useUpdateTemplate } from "@/features/templates/hooks/useUpdateTemplate";
import { useSendTestEmail } from "@/features/templates/hooks/useSendTestEmail";
import { t } from "@/utils/t";

const schema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(998),
  fromName: z.string().min(1).max(255),
  replyTo: z.string().email().optional().or(z.literal("")),
  preheader: z.string().max(255).optional(),
  mjml: z.string().min(1).max(500_000),
});

type FormValues = z.infer<typeof schema>;

function compilePreview(
  mjmlSource: string,
  sampleDataStr: string
): { html: string; error: string | null } {
  try {
    let data: Record<string, unknown> = {};
    if (sampleDataStr.trim()) {
      data = JSON.parse(sampleDataStr) as Record<string, unknown>;
    }
    const template = Handlebars.compile(mjmlSource);
    const substituted = template(data);
    const result = mjml(substituted, { validationLevel: "skip" });
    if (result.errors.length > 0) {
      return {
        html: "",
        error: result.errors.map((e) => e.formattedMessage ?? e.message).join("\n"),
      };
    }
    return { html: result.html, error: null };
  } catch (e) {
    return { html: "", error: (e as Error).message };
  }
}

export function TemplateEditorPage({ id }: { id: string }) {
  const { data: template, isLoading } = useTemplate(id);
  const { mutate: update, isPending } = useUpdateTemplate(id);
  const { mutate: sendTest, isPending: isSending } = useSendTestEmail(id);

  const [sampleData, setSampleData] = useState("");
  const [sampleDataError, setSampleDataError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [formReady, setFormReady] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mjmlValue = useWatch({ control, name: "mjml" });

  useEffect(() => {
    if (template && !formReady) {
      reset({
        name: template.name,
        subject: template.subject,
        fromName: template.fromName,
        replyTo: template.replyTo ?? "",
        preheader: template.preheader ?? "",
        mjml: template.mjml,
      });
      setFormReady(true);
    }
  }, [template, formReady, reset]);

  useEffect(() => {
    if (!mjmlValue) return;

    if (sampleData.trim()) {
      try {
        JSON.parse(sampleData);
        setSampleDataError(null);
      } catch {
        setSampleDataError(t("templateEditor.sampleData.invalid"));
        return;
      }
    } else {
      setSampleDataError(null);
    }

    const timer = setTimeout(() => {
      const { html, error } = compilePreview(mjmlValue, sampleData);
      setPreviewHtml(html);
      setCompilationError(error);
    }, 300);

    return () => clearTimeout(timer);
  }, [mjmlValue, sampleData]);

  function handleSendTest() {
    let parsed: Record<string, unknown> = {};
    try {
      if (sampleData.trim()) parsed = JSON.parse(sampleData);
    } catch {
      // invalid JSON — send with empty data
    }
    sendTest(parsed, {
      onSuccess: () => toast.success(t("templateEditor.testSend.success")),
      onError: (err) => {
        if (err instanceof Error && err.message === "rate_limit_exceeded") {
          toast.error(t("templateEditor.testSend.rateLimitError"));
        } else {
          toast.error(t("templateEditor.testSend.deliveryError"));
        }
      },
    });
  }

  function onSubmit(data: FormValues) {
    update(
      {
        name: data.name,
        subject: data.subject,
        fromName: data.fromName,
        replyTo: data.replyTo || null,
        preheader: data.preheader || null,
        mjml: data.mjml,
      },
      {
        onSuccess: () => toast.success(t("templateEditor.saveSuccess")),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : t("templateEditor.saveError")),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="flex gap-0 h-[calc(100vh-12rem)]">
          <Skeleton className="h-full flex-1 rounded-r-none" />
          <Skeleton className="h-full flex-1 rounded-l-none" />
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col h-[calc(100vh-4rem)]"
    >
      <div className="flex items-center gap-4 px-4 py-3 border-b shrink-0">
        <Link
          href="/templates"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeftIcon className="size-4" />
          {t("templateEditor.backToTemplates")}
        </Link>
        <Field className="flex-1 min-w-0">
          <FieldLabel className="sr-only">{t("templateEditor.fields.name")}</FieldLabel>
          <Input
            placeholder={t("templateEditor.fields.name")}
            className="font-medium"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <ShareTemplateSheet
          templateId={id}
          isOwner={template?.role === "owner"}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSending}
          onClick={handleSendTest}
        >
          {isSending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {isSending ? t("templateEditor.testSend.sending") : t("templateEditor.testSend.button")}
        </Button>
        <Button type="submit" disabled={isPending} className="shrink-0">
          {isPending && <Spinner data-icon="inline-start" />}
          {isPending ? t("templateEditor.saving") : t("templateEditor.save")}
        </Button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-4 w-1/2 p-4 overflow-y-auto border-r">
          <FieldGroup>
            <Field data-invalid={!!errors.subject}>
              <FieldLabel htmlFor="subject">{t("templateEditor.fields.subject")}</FieldLabel>
              <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
              {errors.subject && <FieldError>{errors.subject.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.fromName}>
              <FieldLabel htmlFor="fromName">{t("templateEditor.fields.fromName")}</FieldLabel>
              <Input id="fromName" aria-invalid={!!errors.fromName} {...register("fromName")} />
              {errors.fromName && <FieldError>{errors.fromName.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.replyTo}>
              <FieldLabel htmlFor="replyTo">{t("templateEditor.fields.replyTo")}</FieldLabel>
              <Input
                id="replyTo"
                type="email"
                aria-invalid={!!errors.replyTo}
                {...register("replyTo")}
              />
              {errors.replyTo && <FieldError>{errors.replyTo.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.preheader}>
              <FieldLabel htmlFor="preheader">
                {t("templateEditor.fields.preheader")}
              </FieldLabel>
              <Input
                id="preheader"
                aria-invalid={!!errors.preheader}
                {...register("preheader")}
              />
              {errors.preheader && <FieldError>{errors.preheader.message}</FieldError>}
            </Field>
          </FieldGroup>

          <Separator />

          <Field data-invalid={!!errors.mjml} className="flex flex-col">
            <FieldLabel htmlFor="mjml">{t("templateEditor.fields.mjml")}</FieldLabel>
            <Textarea
              id="mjml"
              rows={16}
              className="font-mono text-xs"
              aria-invalid={!!errors.mjml}
              {...register("mjml")}
            />
            {errors.mjml && <FieldError>{errors.mjml.message}</FieldError>}
          </Field>

          <Field data-invalid={!!sampleDataError}>
            <FieldLabel htmlFor="sampleData">{t("templateEditor.sampleData.label")}</FieldLabel>
            <Textarea
              id="sampleData"
              rows={4}
              className="font-mono text-xs"
              value={sampleData}
              onChange={(e) => setSampleData(e.target.value)}
              placeholder='{ "name": "Alice" }'
            />
            {sampleDataError && <FieldError>{sampleDataError}</FieldError>}
            <FieldDescription>{t("templateEditor.sampleData.description")}</FieldDescription>
          </Field>
        </div>

        <div className="flex-1 overflow-hidden">
          <TemplatePreviewPane html={previewHtml} compilationError={compilationError} />
        </div>
      </div>
    </form>
  );
}
