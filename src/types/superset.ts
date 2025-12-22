// Superset Dashboard Types

export type SupersetDashboard = {
  id: number;
  superset_id: string;
  slug: string;
  title: string;
  description: string | null;
  title_en: string;
  title_ms: string;
  description_en: string | null;
  description_ms: string | null;
  category: string | null;
  icon: string | null;
  order: number;
  is_active: boolean;
  is_public: boolean;
  ui_config: UIConfig;
  default_filters: Record<string, any>;
  rls_config: RLSRule[];
  tags: string[];
  thumbnail_url: string | null;
  roles: DashboardRole[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type UIConfig = {
  hideTitle?: boolean;
  hideTab?: boolean;
  hideChartControls?: boolean;
  filtersExpanded?: boolean;
  filtersVisible?: boolean;
}

export type RLSRule = {
  dataset?: number;
  clause?: string;
}

export type DashboardRole = {
  id: number;
  name: string;
  slug: string;
  permissions: RolePermissions;
}

export type RolePermissions = {
  can_view: boolean;
  can_export: boolean;
  can_share: boolean;
  custom_rls: RLSRule[] | null;
}

export type GuestTokenResponse = {
  token: string;
}

export type DashboardListResponse = {
  dashboards: SupersetDashboard[];
  meta?: {
    total: number;
    current_page: number;
    per_page: number;
  };
}
