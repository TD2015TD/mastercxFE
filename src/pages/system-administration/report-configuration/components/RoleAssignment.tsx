import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';
// @ts-ignore
import { Checkbox } from '../../../../components/ui/Checkbox';
import supersetDashboardService, { type SupersetDashboard } from '../../../../services/supersetDashboardService';
import { getRoles } from '../../../../services/roleService';

interface RoleAssignmentProps {
  dashboard: SupersetDashboard;
  onClose: () => void;
  onSuccess: () => void;
}

interface RolePermission {
  role_id: number;
  roleName: string;
  can_view: boolean;
  can_export: boolean;
  can_share: boolean;
  isAssigned: boolean;
}

const RoleAssignment: React.FC<RoleAssignmentProps> = ({ dashboard, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();

      if (response.success && response.data) {
        const rolesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        const roles = rolesData;

        // Map roles to permissions with current assignments
        const permissions: RolePermission[] = roles.map((role: any) => {
          const assignedRole = dashboard.roles?.find((r) => r.id === role.id);

          return {
            role_id: role.id,
            roleName: role.name,
            can_view: assignedRole?.can_view ?? true,
            can_export: assignedRole?.can_export ?? false,
            can_share: assignedRole?.can_share ?? false,
            isAssigned: !!assignedRole,
          };
        });

        setRolePermissions(permissions);
      } else {
        toast.error('Failed to load roles');
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = (roleId: number) => {
    setRolePermissions((prev) =>
      prev.map((rp) =>
        rp.role_id === roleId
          ? { ...rp, isAssigned: !rp.isAssigned, can_view: !rp.isAssigned ? true : rp.can_view }
          : rp
      )
    );
  };

  const handleTogglePermission = (
    roleId: number,
    permission: 'can_view' | 'can_export' | 'can_share'
  ) => {
    setRolePermissions((prev) =>
      prev.map((rp) =>
        rp.role_id === roleId
          ? { ...rp, [permission]: !rp[permission] }
          : rp
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Only include assigned roles
      const assignedRoles = rolePermissions
        .filter((rp) => rp.isAssigned)
        .map((rp) => ({
          role_id: rp.role_id,
          can_view: rp.can_view,
          can_export: rp.can_export,
          can_share: rp.can_share,
        }));

      const response = await supersetDashboardService.assignRoles(dashboard.id, assignedRoles);

      if (response.success) {
        toast.success('Role assignments updated successfully');
        onSuccess();
      } else {
        toast.error(response.error || 'Failed to update role assignments');
      }
    } catch (error) {
      console.error('Error updating role assignments:', error);
      toast.error('Failed to update role assignments');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground flex items-center">
              <Icon name="Users" className="mr-2" size={24} />
              Manage Role Access
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard: {dashboard.title_en}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader" size={32} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  <Icon name="Info" size={16} className="inline mr-1" />
                  Assign roles to grant access to this dashboard. Configure permissions for each role.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Assigned
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                        Role
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                        Can View
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                        Can Export
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                        Can Share
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rolePermissions.map((rp) => (
                      <tr
                        key={rp.role_id}
                        className={`hover:bg-muted/30 ${
                          rp.isAssigned ? 'bg-primary/5' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <Checkbox
                            checked={rp.isAssigned}
                            onChange={() => handleToggleRole(rp.role_id)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">{rp.roleName}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={rp.can_view}
                            onChange={() => handleTogglePermission(rp.role_id, 'can_view')}
                            disabled={!rp.isAssigned}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={rp.can_export}
                            onChange={() => handleTogglePermission(rp.role_id, 'can_export')}
                            disabled={!rp.isAssigned}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            checked={rp.can_share}
                            onChange={() => handleTogglePermission(rp.role_id, 'can_share')}
                            disabled={!rp.isAssigned}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {rolePermissions.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No roles available</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {rolePermissions.filter((rp) => rp.isAssigned).length} role(s) assigned
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSave}
              disabled={saving}
              iconName={saving ? 'Loader' : 'Save'}
              iconPosition="left"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignment;
