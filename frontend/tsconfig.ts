{
    "compilerOptions"; {
      "target"; "ESNext";                       
      "lib"; ["DOM", "DOM.Iterable", "ESNext"];
      "jsx"; "react-jsx";                  // New JSX transform       
      "module"; "ESNext";
      "moduleResolution"; "Node";
      "resolveJsonModule";true;
      "allowSyntheticDefaultImports"; true;
      "esModuleInterop"; true;
      "strict"; true;
      "skipLibCheck"; true;
      "forceConsistentCasingInFileNames"; true;
      "isolatedModules"; true;                  // Vite/Next.js require this
      "noEmit"; true ;                           // don’t output JS, handled by Vite
    };
    "include"; ["src"];
    "exclude"; ["node_modules"]
}
  