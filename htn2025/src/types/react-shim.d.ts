// Minimal React + JSX shims to satisfy TypeScript without real deps

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react' {
  export const useState: any;
  export const useRef: any;
  export const useEffect: any;
  export const useCallback: any;
  export const useMemo: any;
  const React: any;
  export default React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
}
