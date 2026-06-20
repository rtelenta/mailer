"use client";

import { useEffect, useRef } from "react";
import { EditorView, lineNumbers, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { xml } from "@codemirror/lang-xml";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  lang?: "xml" | "json";
  placeholder?: string;
  className?: string;
}

export function CodeEditor({ value, onChange, lang = "xml", placeholder, className }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const lastValueRef = useRef<string>(value);

  useEffect(() => {
    if (!containerRef.current) return;

    const langExtension = lang === "json" ? json() : xml();

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(),
          langExtension,
          oneDark,
          ...(placeholder ? [cmPlaceholder(placeholder)] : []),
          EditorView.theme({
            "&": { height: "100%", minHeight: "24rem", fontSize: "12px" },
            ".cm-scroller": { overflow: "auto", fontFamily: "var(--font-mono, monospace)" },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const next = update.state.doc.toString();
              lastValueRef.current = next;
              onChange(next);
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync value changes from outside (e.g., form.reset() after template loads)
  useEffect(() => {
    const view = viewRef.current;
    if (!view || value === lastValueRef.current) return;
    lastValueRef.current = value;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value },
    });
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={cn("rounded-lg border border-input overflow-hidden", className)}
    />
  );
}
