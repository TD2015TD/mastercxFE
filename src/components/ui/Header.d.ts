export interface HeaderUser {
  name: string;
  email: string;
  role: string;
  department?: string;
  avatar?: string | null;
}

export interface HeaderProps {
  user?: HeaderUser | null;
  onMenuToggle?: () => void;
}

export default function Header(props: HeaderProps): JSX.Element;
