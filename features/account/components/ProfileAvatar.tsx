interface ProfileAvatarProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export function ProfileAvatar({ name, email }: ProfileAvatarProps) {
  const initial = (name || email || "?")[0].toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
      {initial}
    </div>
  );
}
