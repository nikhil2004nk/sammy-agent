import { WorkspaceLayout } from '@/shell/WorkspaceLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
