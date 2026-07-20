import { ShellLayout } from '@/shell/ShellLayout';

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellLayout>{children}</ShellLayout>;
}
