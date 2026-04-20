import { DataSource } from 'typeorm';
import { Permission } from '../../roles/entities/permission.entity';

export interface PermissionSeedData {
  code: string;
  name: string;
  description: string;
  module: string;
}

export const PERMISSIONS: PermissionSeedData[] = [
  // Applications
  { module: 'applications', code: 'applications:create',   name: 'Create Application',   description: 'Submit a new research ethics application' },
  { module: 'applications', code: 'applications:read',     name: 'Read Applications',    description: 'View application details and status' },
  { module: 'applications', code: 'applications:update',   name: 'Update Application',   description: 'Edit a draft or resubmit an application' },
  { module: 'applications', code: 'applications:delete',   name: 'Delete Application',   description: 'Delete a draft application' },
  { module: 'applications', code: 'applications:submit',   name: 'Submit Application',   description: 'Submit an application for review' },
  { module: 'applications', code: 'applications:withdraw', name: 'Withdraw Application', description: 'Withdraw a submitted application' },
  // Reviews
  { module: 'reviews', code: 'reviews:read',     name: 'Read Reviews',    description: 'View review assignments, comments, and scores' },
  { module: 'reviews', code: 'reviews:assign',   name: 'Assign Reviewers', description: 'Assign reviewers to applications' },
  { module: 'reviews', code: 'reviews:submit',   name: 'Submit Review',   description: 'Submit comments and scores for an assigned review' },
  { module: 'reviews', code: 'reviews:complete', name: 'Complete Review', description: 'Mark a review as completed' },
  // Payments
  { module: 'payments', code: 'payments:read',   name: 'Read Payments',   description: 'View invoices, receipts, and payment status' },
  { module: 'payments', code: 'payments:manage', name: 'Manage Payments', description: 'Initiate, verify, and reconcile payments' },
  // Certificates
  { module: 'certificates', code: 'certificates:read',     name: 'Read Certificates',     description: 'View issued ethical clearance certificates' },
  { module: 'certificates', code: 'certificates:generate', name: 'Generate Certificate',  description: 'Generate and issue ethical clearance certificates' },
  // Meetings
  { module: 'meetings', code: 'meetings:read',   name: 'Read Meetings',   description: 'View meeting schedules, agendas, and minutes' },
  { module: 'meetings', code: 'meetings:manage', name: 'Manage Meetings', description: 'Schedule, update, and record committee meetings' },
  // Monitoring
  { module: 'monitoring', code: 'monitoring:read',   name: 'Read Monitoring',   description: 'View progress reports and AE/SAE events' },
  { module: 'monitoring', code: 'monitoring:update', name: 'Update Monitoring',  description: 'Submit progress reports and follow up on AE/SAE events' },
  // Users
  { module: 'users', code: 'users:read',   name: 'Read Users',   description: 'View user profiles and role assignments' },
  { module: 'users', code: 'users:manage', name: 'Manage Users', description: 'Create, update, deactivate users and assign roles' },
  // Tenants
  { module: 'tenants', code: 'tenants:read',   name: 'Read Tenants',   description: 'View tenant/institution details' },
  { module: 'tenants', code: 'tenants:manage', name: 'Manage Tenants', description: 'Create and configure tenant institutions' },
  // Reports
  { module: 'reports', code: 'reports:view',   name: 'View Reports',   description: 'Access dashboards and predefined reports' },
  { module: 'reports', code: 'reports:export', name: 'Export Reports',  description: 'Export data to Excel, CSV, or PDF' },
  // Settings
  { module: 'settings', code: 'settings:read',   name: 'Read Settings',   description: 'View tenant workflow, fee, and form configuration' },
  { module: 'settings', code: 'settings:manage', name: 'Manage Settings', description: 'Configure workflows, fees, and form templates' },
];

export async function seedPermissions(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(Permission);

  const existing = await repo.count();
  if (existing > 0) {
    console.log(`  [permissions] Skipping — ${existing} permissions already exist`);
    return;
  }

  await repo.save(repo.create(PERMISSIONS));
  console.log(`  [permissions] Seeded ${PERMISSIONS.length} permissions`);
}
