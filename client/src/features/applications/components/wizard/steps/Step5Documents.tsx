import { useState, useRef } from 'react';
import { Upload, FileCheck, File, Info } from 'lucide-react';
import { DOC_TYPES } from '../../../constants/formSteps';
import Button from '@/components/Button';

type UploadedFiles = Record<string, File | null>;

export function Step5Documents() {
  const [files, setFiles] = useState<UploadedFiles>({});

  const uploadFile = (key: string, file: File) =>
    setFiles((prev) => ({ ...prev, [key]: file }));

  const removeFile = (key: string) =>
    setFiles((prev) => ({ ...prev, [key]: null }));

  const required = DOC_TYPES.filter((d) => d.required);
  const optional = DOC_TYPES.filter((d) => !d.required);
  const uploadedRequired = required.filter((d) => files[d.key]).length;

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
        className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
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
                docType={doc}
                file={files[doc.key] ?? null}
                onUpload={uploadFile}
                onRemove={removeFile}
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
                docType={doc}
                file={files[doc.key] ?? null}
                onUpload={uploadFile}
                onRemove={removeFile}
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
  docType: (typeof DOC_TYPES)[number];
  file: File | null;
  onUpload: (key: string, file: File) => void;
  onRemove: (key: string) => void;
}

function DocUploadCard({ docType, file, onUpload, onRemove }: DocUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onUpload(docType.key, dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onUpload(docType.key, selected);
  };

  return (
    <article
      className={`overflow-hidden rounded-lg border transition-colors duration-200 ${
        file ? 'border-green-200 bg-green-50' : 'border-primary/10 bg-white'
      }`}
    >
      {/* Top row */}
      <section className="flex items-center gap-3 px-4 py-3">
        <figure
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
            file ? 'bg-green-100' : 'bg-primary/6'
          }`}
          aria-hidden
        >
          {file ? (
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
          {file ? (
            <p className="mt-0.5 text-[11px] text-green-700">
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-primary/40">
              {docType.formats} · Max {docType.maxMB} MB
            </p>
          )}
        </section>

        {file ? (
          <Button
            onClick={() => onRemove(docType.key)}
            className="shrink-0 rounded-md border border-primary/15 bg-white px-3 py-1.5 text-[11px] font-medium text-primary/60 transition-colors hover:border-red-200 hover:text-red-600"
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
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-accent/30 bg-accent/6 px-3 py-1.5 text-[11px] font-semibold text-accent transition-colors hover:bg-accent/10"
            >
              <Upload className="size-3" aria-hidden />
              Upload
            </Button>
          </>
        )}
      </section>

      {/* Drop zone (only shown when no file) */}
      {!file && (
        <section
          role="presentation"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center gap-2 border-t border-dashed border-primary/10 bg-primary/2 px-4 py-2.5 transition-colors hover:bg-primary/5"
        >
          <Upload className="size-3 text-primary/25" aria-hidden />
          <span className="text-[11px] text-primary/35">Drag and drop here, or click to browse</span>
        </section>
      )}
    </article>
  );
}
