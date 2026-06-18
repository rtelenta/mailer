import { AppNav } from "./AppNav";

export function AppSidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-background py-4">
      <div className="px-5 pb-4">
        <span className="text-sm font-semibold tracking-tight">Mailer</span>
      </div>
      <AppNav />
    </aside>
  );
}
