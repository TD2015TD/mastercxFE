export interface NavigationSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  userRole?: string;
}

export default function NavigationSidebar(props: NavigationSidebarProps): JSX.Element;
