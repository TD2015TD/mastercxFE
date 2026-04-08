export interface Breadcrumb {
  label: string;
  path?: string;
  isActive?: boolean;
}

export interface BreadcrumbNavigationProps {
  customBreadcrumbs?: Breadcrumb[] | null;
}

export default function BreadcrumbNavigation(props: BreadcrumbNavigationProps): JSX.Element;
