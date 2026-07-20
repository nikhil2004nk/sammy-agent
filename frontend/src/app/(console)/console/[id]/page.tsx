import { ConversationPanel } from '@/modules/agent-console/ConversationPanel';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  return <ConversationPanel conversationId={id} />;
}
