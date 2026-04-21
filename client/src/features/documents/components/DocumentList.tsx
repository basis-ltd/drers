import type { ApplicationDocument } from '@/features/applications/api/types';
import { DocumentExtractionCard } from './DocumentExtractionCard';

interface Props {
  documents: ApplicationDocument[];
  compact?: boolean;
}

export function DocumentList({ documents, compact }: Props) {
  if (documents.length === 0) {
    return (
      <section className="rounded-md border border-dashed border-primary/15 bg-white p-8 text-center text-[12px] text-primary/50">
        No documents uploaded.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((d) => (
        <DocumentExtractionCard key={d.id} document={d} compact={compact} />
      ))}
    </div>
  );
}
