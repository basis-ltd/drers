import { useMemo, useState } from 'react';
import {
  useAssignReviewerMutation,
  useListReviewersQuery,
} from '@/features/reviews/api/reviewsApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface Props {
  applicationId: string;
}

export function AssignReviewerPanel({ applicationId }: Props) {
  const { data: reviewers = [], isLoading } = useListReviewersQuery();
  const [assign, { isLoading: isSubmitting, error }] =
    useAssignReviewerMutation();
  const [reviewerId, setReviewerId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return reviewers;
    const q = query.toLowerCase();
    return reviewers.filter((r) =>
      `${r.firstName} ${r.surname} ${r.email}`.toLowerCase().includes(q),
    );
  }, [query, reviewers]);

  const submit = async () => {
    if (!reviewerId) return;
    await assign({
      applicationId,
      body: { reviewerId, dueAt: dueAt || undefined },
    }).unwrap();
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Find reviewer
        </label>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="w-full rounded-sm border border-primary/15 px-2.5 py-1.5 text-[12px] text-primary outline-none focus:border-primary/40"
        />
      </div>

      <div className="max-h-60 overflow-y-auto rounded-sm border border-primary/10">
        {isLoading ? (
          <p className="px-3 py-4 text-[11px] text-primary/45">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-4 text-[11px] text-primary/45">
            No reviewers found.
          </p>
        ) : (
          <ul className="divide-y divide-primary/6">
            {filtered.map((r) => {
              const selected = reviewerId === r.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setReviewerId(r.id)}
                    className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-[12px] transition-colors ${
                      selected
                        ? 'bg-primary/5'
                        : 'hover:bg-primary/3'
                    }`}
                  >
                    <span className="text-primary">
                      {r.professionalTitle ? `${r.professionalTitle}. ` : ''}
                      {r.firstName} {r.surname}
                    </span>
                    <span className="text-[10.5px] text-primary/45">
                      {r.email}
                      {r.institutionalAffiliation
                        ? ` · ${r.institutionalAffiliation}`
                        : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-medium tracking-wider text-primary/55 uppercase">
          Due date (optional)
        </label>
        <input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="w-full rounded-sm border border-primary/15 px-2.5 py-1.5 text-[12px] text-primary outline-none focus:border-primary/40"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-600">
          {(error as { data?: { message?: string } }).data?.message ??
            'Failed to assign reviewer'}
        </p>
      )}

      <button
        type="button"
        disabled={!reviewerId || isSubmitting}
        onClick={submit}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground disabled:opacity-40"
      >
        <FontAwesomeIcon icon={faPaperPlane} className="size-3" />
        {isSubmitting ? 'Assigning…' : 'Assign reviewer'}
      </button>
    </div>
  );
}
