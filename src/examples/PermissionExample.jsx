import React from 'react';
import Can, { usePermission } from '../components/Can';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

/**
 * Example component showing how to use the permission system
 */
const PermissionExample = () => {
  const { can, canAny, canAll, isSuperAdmin } = usePermission();

  const handleCreateUser = () => {
    if (!can('user.manage')) {
      toast.error('You do not have permission to create users');
      return;
    }
    // Proceed with user creation...
    console.log('Creating user...');
  };

  const handleEditTicket = () => {
    if (!can('ticket.edit')) {
      toast.error('You do not have permission to edit tickets');
      return;
    }
    // Proceed with ticket edit...
    console.log('Editing ticket...');
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Permission System Examples</h2>

      {/* Example 1: Hide/Show based on single permission */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 1: Single Permission Check</h3>
        
        <Can permission="user.manage">
          <Button onClick={handleCreateUser}>
            Create User (Only visible with user.manage permission)
          </Button>
        </Can>

        <Can permission="ticket.edit">
          <Button onClick={handleEditTicket} variant="outline" className="ml-2">
            Edit Ticket (Only visible with ticket.edit permission)
          </Button>
        </Can>
      </section>

      {/* Example 2: Any of multiple permissions */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 2: Any Permission (OR logic)</h3>
        
        <Can anyOf={['ticket.edit', 'ticket.delete', 'ticket.assign']}>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
            <p className="text-sm">
              This section is visible if you have ANY of these permissions:
              ticket.edit, ticket.delete, or ticket.assign
            </p>
            <div className="mt-2 space-x-2">
              <Can permission="ticket.edit">
                <Button size="sm">Edit</Button>
              </Can>
              <Can permission="ticket.delete">
                <Button size="sm" variant="danger">Delete</Button>
              </Can>
              <Can permission="ticket.assign">
                <Button size="sm" variant="outline">Assign</Button>
              </Can>
            </div>
          </div>
        </Can>
      </section>

      {/* Example 3: All permissions required */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 3: All Permissions (AND logic)</h3>
        
        <Can allOf={['ticket.edit', 'ticket.assign']}>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
            <p className="text-sm">
              This section requires BOTH ticket.edit AND ticket.assign permissions
            </p>
            <Button className="mt-2">Edit & Reassign Ticket</Button>
          </div>
        </Can>
      </section>

      {/* Example 4: Fallback content */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 4: With Fallback Content</h3>
        
        <Can 
          permission="system.config"
          fallback={
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ You don't have access to system configuration
              </p>
            </div>
          }
        >
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
            <p className="text-sm">System Configuration Panel</p>
            <Button className="mt-2">Configure System</Button>
          </div>
        </Can>
      </section>

      {/* Example 5: Using the hook for conditional logic */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 5: Using usePermission Hook</h3>
        
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Can manage users:</strong> {can('user.manage') ? '✅ Yes' : '❌ No'}
          </p>
          <p className="text-sm">
            <strong>Can edit OR delete tickets:</strong> {canAny(['ticket.edit', 'ticket.delete']) ? '✅ Yes' : '❌ No'}
          </p>
          <p className="text-sm">
            <strong>Has full ticket permissions:</strong> {canAll(['ticket.edit', 'ticket.delete', 'ticket.assign']) ? '✅ Yes' : '❌ No'}
          </p>
          <p className="text-sm">
            <strong>Is Super Admin:</strong> {isSuperAdmin() ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </section>

      {/* Example 6: Complex nested permissions */}
      <section className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Example 6: Complex Nested Permissions</h3>
        
        <Can permission="report.view">
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded space-y-2">
            <p className="font-medium">Reports Dashboard</p>
            
            <div className="flex gap-2">
              <Button size="sm">View Reports</Button>
              
              <Can permission="report.create">
                <Button size="sm" variant="outline">Create Report</Button>
              </Can>
              
              <Can permission="report.export">
                <Button size="sm" variant="outline">Export Reports</Button>
              </Can>
            </div>
          </div>
        </Can>
      </section>
    </div>
  );
};

export default PermissionExample;
