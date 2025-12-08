// Type declarations for JSX modules
declare module 'components/*' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module 'pages/*' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module './pages/*' {
  const Component: React.ComponentType<any>;
  export default Component;
}

declare module './components/*' {
  const Component: React.ComponentType<any>;
  export default Component;
}
