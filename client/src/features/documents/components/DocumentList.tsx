import type { ApplicationDocument } from "@/features/applications/api/types";
import { DocumentExtractionCard } from "./DocumentExtractionCard";

interface Props {
  documents: ApplicationDocument[];
  compact?: boolean;
  applicationId?: string;
  canTriggerManualOcr?: boolean;
  showExtractedText?: boolean;
}

export function DocumentList({
  documents,
  compact,
  applicationId,
  canTriggerManualOcr,
  showExtractedText = true,
}: Props) {
  if (documents.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-primary/20 bg-white px-6 py-10 text-center">
        <p className="text-[14px] font-medium text-primary/75">
          No documents uploaded.
        </p>
        <p className="mt-1 text-[12px] text-primary/55">
          Uploaded files and OCR screening results will appear here.
        </p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {documents.map((d) => (
        <DocumentExtractionCard
          key={d.id}
          document={d}
          compact={compact}
          applicationId={applicationId}
          canTriggerManualOcr={canTriggerManualOcr}
          showExtractedText={showExtractedText}
        />
      ))}
    </div>
  );
}
