import { useMemo, useRef } from 'react';
import { Upload, FileCheck, File, Info, Check } from 'lucide-react';
import { toast } from 'sonner';
import { DOC_TYPES } from '../../../constants/formSteps';
import Button from '@/components/Button';
import {
  useDeleteDocumentMutation,
  useListDocumentsQuery,
} from '../../../api/applicationsApi';
import type { ApplicationDocument, DocumentType } from '../../../api/types';
import useDocumentUpload from '../../../hooks/useDocumentUpload';

const DOC_TYPE_MAP: Record<string, DocumentType> = {
  protocol: 'PROTOCOL',
  consent: 'INFORMED_CONSENT_FORM',
  cv: 'PRINCIPAL_INVESTIGATOR_CV',
  ethics_cert: 'ETHICS_TRAINING_CERT',
  nhra_cert: 'NHRA_RESEARCHER_CERT',
  cover_letter: 'COVER_LETTER',
  budget: 'BUDGET',
  other: 'OTHER',
};

interface Step5DocumentsProps {
  applicationId: string;
}

export function Step5Documents({ applicationId }: Step5DocumentsProps) {
  const { data: documents = [], refetch } = useListDocumentsQuery(applicationId, {
    skip: !applicationId,
  });
  const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteDocumentMutation();

  const docsByType = useMemo(
    () => new Map(documents.map((doc) => [doc.documentType, doc])),
    [documents],
  );

  const required = DOC_TYPES.filter((d) => d.required);
  const optional = DOC_TYPES.filter((d) => !d.required);
  const uploadedRequired = required.filter((d) => docsByType.has(DOC_TYPE_MAP[d.key])).length;

  const handleRemove = async (doc: ApplicationDocument) => {
    try {
      await deleteDocument({ id: applicationId, docId: doc.id }).unwrap();
      toast.success(`${doc.originalFilename} removed.`);
      await refetch();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Unable to remove document.';
      toast.error(message);
    }
  };

  return (
    <section aria-label="Document uploads">
      <header className="mb-6">
        <h2 className="heading-section">Documents</h2>
        <p className="mt-0.5 text-[11px] text-primary/50">
          All required documents must be uploaded before submitting your application.
        </p>
      </header>

      {/* Info banner */}
      <aside
        role="note"
        className="mb-5 flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden />
        <p className="text-[11px] leading-relaxed text-amber-800">
          <strong>{uploadedRequired} of {required.length}</strong> required documents uploaded.
          Applications submitted with missing documents may be rejected at screening.
        </p>
      </aside>

      <section className="mb-7">
        <h3 className="mb-3 text-[12px] font-semibold text-primary">Required Documents</h3>
        <ul className="space-y-2.5">
          {required.map((doc) => (
            <li key={doc.key}>
              <DocUploadCard
                applicationId={applicationId}
                docType={doc}
                document={docsByType.get(DOC_TYPE_MAP[doc.key]) ?? null}
                onRemove={handleRemove}
                onUploaded={() => void refetch()}
                isDeletingDocument={isDeletingDocument}
              />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-[12px] font-semibold text-primary">Optional Documents</h3>
        <ul className="space-y-2.5">
          {optional.map((doc) => (
            <li key={doc.key}>
              <DocUploadCard
                applicationId={applicationId}
                docType={doc}
                document={docsByType.get(DOC_TYPE_MAP[doc.key]) ?? null}
                onRemove={handleRemove}
                onUploaded={() => void refetch()}
                isDeletingDocument={isDeletingDocument}
              />
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}

// ── Upload card ───────────────────────────────────────────────────────────────

interface DocUploadCardProps {
  applicationId: string;
  docType: (typeof DOC_TYPES)[number];
  document: ApplicationDocument | null;
  onRemove: (doc: ApplicationDocument) => Promise<void>;
  onUploaded: () => void;
  isDeletingDocument: boolean;
}

function isAllowedFormat(file: File, formatsLabel: string): boolean {
  if (formatsLabel.toLowerCase().includes('any format')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowedExts = formatsLabel
    .split(',')
    .map((item) => item.trim().toLowerCase().replace('.', ''));
  return allowedExts.includes(ext);
}

function DocUploadCard({
  applicationId,
  docType,
  document,
  onRemove,
  onUploaded,
  isDeletingDocument,
}: DocUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    uploadDocument,
    progress,
    phase,
    isUploading,
    isComplete,
    error: uploadError,
    reset,
  } = useDocumentUpload();

  const handleUpload = async (selectedFile: File) => {
    const maxBytes = docType.maxMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      toast.error(`${docType.label} exceeds ${docType.maxMB} MB.`);
      return;
    }
    if (!isAllowedFormat(selectedFile, docType.formats)) {
      toast.error(`Invalid file type. Allowed: ${docType.formats}.`);
      return;
    }

    try {
      await uploadDocument({
        applicationId,
        documentType: DOC_TYPE_MAP[docType.key],
        isRequired: docType.required,
        file: selectedFile,
      });
      toast.success(`${docType.label} uploaded successfully.`);
      onUploaded();
      window.setTimeout(() => reset(), 2500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      toast.error(message);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      void handleUpload(dropped);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      void handleUpload(selected);
    }
    e.target.value = '';
  };

  return (
    <article
      className={`overflow-hidden rounded-md border transition-colors duration-200 ${
        document ? 'border-green-700 border-[0.5px] bg-green-40' : 'border-primary/10 bg-white'
      }`}
    >
      {/* Top row */}
      <section className="flex items-center gap-3 px-4 py-3">
        <figure
          className={`flex size-9 shrink-0 items-center justify-center rounded-md ${
            document ? 'bg-green-100' : 'bg-primary/6'
          }`}
          aria-hidden
        >
          {document ? (
            <FileCheck className="size-4.5 text-green-700" />
          ) : (
            <File className="size-4.5 text-primary/30" />
          )}
        </figure>

        <section className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[12px] font-semibold text-primary">
            {docType.label}
            {docType.required && (
              <mark className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-600">
                Required
              </mark>
            )}
          </p>
          {document ? (
            <p className="mt-0.5 text-[11px] text-green-700">
              {document.originalFilename} · {(document.fileSizeBytes / 1024 / 1024).toFixed(1)} MB
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-primary/40">
              {docType.formats} · Max {docType.maxMB} MB
            </p>
          )}
        </section>

        {document ? (
          <Button
            onClick={() => {
              if (!document || isDeletingDocument) return;
              void onRemove(document);
            }}
            className="shrink-0 rounded-md border border-primary/15 bg-white px-3 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isUploading || isDeletingDocument}
          >
            Remove
          </Button>
        ) : (
          <>
            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              aria-label={`Upload ${docType.label}`}
              onChange={handleChange}
            />
            <Button
              onClick={() => inputRef.current?.click()}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-accent/30 bg-accent/6 px-3 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUploading}
            >
              <Upload className="size-3" aria-hidden />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        )}
      </section>

      <UploadProgress
        progress={progress}
        phase={phase}
        isUploading={isUploading}
        isComplete={isComplete}
        error={uploadError}
      />

      {/* Drop zone (only shown when no file) */}
      {!document && (
        <section
          role="presentation"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onClick={() => {
            if (isUploading) return;
            inputRef.current?.click();
          }}
          className="flex cursor-pointer items-center gap-2 border-t border-dashed border-primary/10 bg-primary/2 px-4 py-2.5 transition-colors hover:bg-primary/5"
        >
          <Upload className="size-3 text-primary/25" aria-hidden />
          <span className="text-[11px] text-primary/35">Drag and drop here, or click to browse</span>
        </section>
      )}
    </article>
  );
}

interface UploadProgressProps {
  progress: number;
  phase: 'uploading' | 'registering' | null;
  isUploading: boolean;
  isComplete: boolean;
  error: string | null;
}

function UploadProgress({
  progress,
  phase,
  isUploading,
  isComplete,
  error,
}: UploadProgressProps) {
  if (!isUploading && !isComplete && !error) return null;

  const statusLabel = isComplete ? 'Uploaded' : phase === 'registering' ? 'Saving...' : `${progress}%`;

  return (
    <section className="border-t border-primary/10 bg-background/40 px-4 py-3">
      <section className="flex items-center justify-between gap-3 text-[11px]">
        <span className="text-primary/60">{statusLabel}</span>
        {isComplete && (
          <span className="inline-flex items-center gap-1 text-green-700">
            <Check className="size-3" />
            Done
          </span>
        )}
      </section>
      <progress
        value={progress}
        max={100}
        className={`mt-2 h-1.5 w-full appearance-none overflow-hidden rounded-full
          [&::-webkit-progress-bar]:rounded-full
          [&::-webkit-progress-bar]:bg-primary/10
          [&::-webkit-progress-value]:rounded-full
          [&::-webkit-progress-value]:transition-all
          [&::-webkit-progress-value]:duration-300
          ${
            isComplete
              ? '[&::-webkit-progress-value]:bg-green-700 [&::-moz-progress-bar]:bg-green-700'
              : '[&::-webkit-progress-value]:bg-accent [&::-moz-progress-bar]:bg-accent'
          }`}
      >
        {progress}%
      </progress>
      {phase === 'registering' && !isComplete && (
        <p className="mt-2 text-[10px] text-primary/45">Saving document metadata...</p>
      )}
      {error && <p className="mt-2 text-[10px] text-red-600">{error}</p>}
    </section>
  );
}
