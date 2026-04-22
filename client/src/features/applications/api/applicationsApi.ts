import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@/features/auth/api/baseQueryWithReauth';
import type {
  ApplicationDocument,
  Application,
  ApplicationDeclaration,
  ApplicationDetails,
  ApplicationEthics,
  ApplicationProtocol,
  ApplicationTeam,
  CreateApplicationDto,
  CreateApplicationResponse,
  ListApplicationsQuery,
  ListApplicationsResponse,
  SubmissionValidationResponse,
  UpdateApplicationDeclarationDto,
  UpdateApplicationDetailsDto,
  UpdateApplicationEthicsDto,
  UpdateApplicationProtocolDto,
  UpdateApplicationTeamDto,
} from './types';

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Application', 'ApplicationList', 'ApplicationDocuments'],
  endpoints: (builder) => ({
    createApplication: builder.mutation<CreateApplicationResponse, CreateApplicationDto>({
      query: (body) => ({ url: '/applications', method: 'POST', body }),
      invalidatesTags: ['ApplicationList'],
    }),

    listApplications: builder.query<ListApplicationsResponse, ListApplicationsQuery>({
      query: (params) => ({ url: '/applications', method: 'GET', params }),
      providesTags: ['ApplicationList'],
    }),

    getApplication: builder.query<Application, string>({
      query: (id) => ({ url: `/applications/${id}`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'Application', id }],
    }),

    submitApplication: builder.mutation<Application, string>({
      query: (id) => ({ url: `/applications/${id}/submit`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Application', id }, 'ApplicationList'],
    }),

    validateSubmitApplication: builder.mutation<SubmissionValidationResponse, string>({
      query: (id) => ({ url: `/applications/${id}/validate-submit`, method: 'GET' }),
    }),

    withdrawApplication: builder.mutation<Application, string>({
      query: (id) => ({ url: `/applications/${id}/withdraw`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Application', id }, 'ApplicationList'],
    }),

    updateDetails: builder.mutation<ApplicationDetails, { id: string; data: UpdateApplicationDetailsDto }>({
      query: ({ id, data }) => ({ url: `/applications/${id}/details`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Application', id }],
    }),

    updateTeam: builder.mutation<ApplicationTeam, { id: string; data: UpdateApplicationTeamDto }>({
      query: ({ id, data }) => ({ url: `/applications/${id}/team`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Application', id }],
    }),

    updateProtocol: builder.mutation<ApplicationProtocol, { id: string; data: UpdateApplicationProtocolDto }>({
      query: ({ id, data }) => ({ url: `/applications/${id}/protocol`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Application', id }],
    }),

    updateEthics: builder.mutation<ApplicationEthics, { id: string; data: UpdateApplicationEthicsDto }>({
      query: ({ id, data }) => ({ url: `/applications/${id}/ethics`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Application', id }],
    }),

    updateDeclaration: builder.mutation<ApplicationDeclaration, { id: string; data: UpdateApplicationDeclarationDto }>({
      query: ({ id, data }) => ({ url: `/applications/${id}/declaration`, method: 'PATCH', body: data }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Application', id }],
    }),

    listDocuments: builder.query<ApplicationDocument[], string>({
      query: (id) => ({ url: `/applications/${id}/documents`, method: 'GET' }),
      providesTags: (_r, _e, id) => [{ type: 'ApplicationDocuments', id }],
    }),

    deleteDocument: builder.mutation<void, { id: string; docId: string }>({
      query: ({ id, docId }) => ({ url: `/applications/${id}/documents/${docId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ApplicationDocuments', id }],
    }),

    triggerManualOcr: builder.mutation<ApplicationDocument, { id: string; docId: string }>({
      query: ({ id, docId }) => ({
        url: `/applications/${id}/documents/${docId}/ocr/manual-extract`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'ApplicationDocuments', id }],
    }),
  }),
});

export const {
  useCreateApplicationMutation,
  useListApplicationsQuery,
  useGetApplicationQuery,
  useSubmitApplicationMutation,
  useValidateSubmitApplicationMutation,
  useWithdrawApplicationMutation,
  useUpdateDetailsMutation,
  useUpdateTeamMutation,
  useUpdateProtocolMutation,
  useUpdateEthicsMutation,
  useUpdateDeclarationMutation,
  useListDocumentsQuery,
  useDeleteDocumentMutation,
  useTriggerManualOcrMutation,
} = applicationsApi;
