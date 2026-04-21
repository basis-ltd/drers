import { useParams } from 'react-router-dom';
import { NewApplicationWizard } from '@/features/applications/components/wizard/NewApplicationWizard';

export function NewApplicationPage() {
  const { id } = useParams<{ id?: string }>();
  return <NewApplicationWizard existingId={id} />;
}
