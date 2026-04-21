import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/features/auth/api/baseQueryWithReauth';
import type {
  AssignReviewerBody,
  ChairDecisionBody,
  Review,
  ReviewUserSummary,
  SubmitReviewerFeedbackBody,
} from './types';

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Review', 'Reviewers'],
  endpoints: (builder) => ({
    getReview: builder.query<Review, string>({
      query: (applicationId) => ({
        url: `/applications/${applicationId}/review`,
        method: 'GET',
      }),
      providesTags: (_r, _e, id) => [{ type: 'Review', id }],
    }),

    listReviewers: builder.query<ReviewUserSummary[], void>({
      query: () => ({ url: '/reviews/reviewers', method: 'GET' }),
      providesTags: ['Reviewers'],
    }),

    assignReviewer: builder.mutation<
      Review,
      { applicationId: string; body: AssignReviewerBody }
    >({
      query: ({ applicationId, body }) => ({
        url: `/applications/${applicationId}/review/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: 'Review', id: applicationId },
      ],
    }),

    submitReviewerFeedback: builder.mutation<
      Review,
      { applicationId: string; body: SubmitReviewerFeedbackBody }
    >({
      query: ({ applicationId, body }) => ({
        url: `/applications/${applicationId}/review/reviewer-feedback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: 'Review', id: applicationId },
      ],
    }),

    chairDecision: builder.mutation<
      Review,
      { applicationId: string; body: ChairDecisionBody }
    >({
      query: ({ applicationId, body }) => ({
        url: `/applications/${applicationId}/review/chair-decision`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { applicationId }) => [
        { type: 'Review', id: applicationId },
      ],
    }),
  }),
});

export const {
  useGetReviewQuery,
  useListReviewersQuery,
  useAssignReviewerMutation,
  useSubmitReviewerFeedbackMutation,
  useChairDecisionMutation,
} = reviewsApi;
