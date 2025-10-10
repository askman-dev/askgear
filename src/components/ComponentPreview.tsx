import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useArtifactStore } from '../store/artifact';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';

interface ComponentPreviewProps {
  className?: string;
}

// Create a safe evaluation context with common dependencies pre-imported
const createSafeContext = () => {
  const context = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    clsx,
    ...LucideIcons, // All Lucide icons available
  };
  
  return context;
};

// Function to safely evaluate component code
const evaluateComponent = (code: string): React.ComponentType<any> | Error => {
  try {
    // Create a safe context with all necessary imports
    const context = createSafeContext();
    const contextKeys = Object.keys(context);
    const contextValues = contextKeys.map(key => context[key as keyof typeof context]);
    
    // Wrap the code to return the component
    const wrappedCode = `
      ${code}
      
      // Try to find and return the default export
      if (typeof export_default !== 'undefined') {
        return export_default;
      } else if (typeof Component !== 'undefined') {
        return Component;
      } else if (typeof default !== 'undefined') {
        return default;
      } else {
        // Try to find any function that looks like a component
        const keys = Object.keys(this || {});
        for (const key of keys) {
          if (typeof this[key] === 'function' && /^[A-Z]/.test(key)) {
            return this[key];
          }
        }
        throw new Error('No React component found. Make sure to export default or define a Component.');
      }
    `;
    
    // Create a function with the context variables
    const evalFunction = new Function(...contextKeys, wrappedCode);
    const Component = evalFunction(...contextValues);
    
    if (!Component || typeof Component !== 'function') {
      throw new Error('Invalid component: must be a React function component');
    }
    
    return Component;
  } catch (error) {
    console.error('Component evaluation error:', error);
    return error as Error;
  }
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">组件渲染错误</h3>
              <p className="text-sm text-red-700">{this.state.error?.message}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ComponentPreview({ className }: ComponentPreviewProps) {
  const { currentArtifact } = useArtifactStore();
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(true);

  // Process and transform the code for safe execution
  const processCode = (code: string): string => {
    // Remove any import statements (they're provided via context)
    let processedCode = code.replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '');
    
    // Replace export default with a variable assignment
    processedCode = processedCode.replace(/export\s+default\s+function\s+(\w+)/g, 'const export_default = function $1');
    processedCode = processedCode.replace(/export\s+default\s+/g, 'const export_default = ');
    
    // Handle arrow function exports
    processedCode = processedCode.replace(/const\s+(\w+)\s*=\s*\((.*?)\)\s*=>/g, 'const $1 = ($2) =>');
    
    return processedCode;
  };

  // Load and evaluate component when artifact changes
  useEffect(() => {
    if (!currentArtifact?.code) {
      setComponent(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Small delay to show loading state
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      try {
        const processedCode = processCode(currentArtifact.code);
        const result = evaluateComponent(processedCode);
        
        if (result instanceof Error) {
          setError(result.message);
          setComponent(null);
        } else {
          setComponent(() => result);
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        setComponent(null);
      } finally {
        setIsLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [currentArtifact?.code]);

  // Listen for preview update events
  useEffect(() => {
    const handlePreviewUpdate = () => {
      // Force re-evaluation by triggering the effect
      if (currentArtifact?.code) {
        const processedCode = processCode(currentArtifact.code);
        const result = evaluateComponent(processedCode);
        
        if (!(result instanceof Error)) {
          setComponent(() => result);
          setError(null);
        }
      }
    };

    window.addEventListener('artifact-preview-update', handlePreviewUpdate);
    return () => {
      window.removeEventListener('artifact-preview-update', handlePreviewUpdate);
    };
  }, [currentArtifact?.code]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (!currentArtifact) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="text-center">
          <div className="inline-block p-6 bg-gray-50 rounded-xl mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-400 to-purple-400 rounded-2xl" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            组件预览区域
          </h3>
          <p className="text-sm text-gray-600">
            通过对话创建的 React 组件将在此处实时渲染预览
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">正在加载组件...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx('flex items-center justify-center', className)}>
        <div className="max-w-md">
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">组件加载失败</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (Component) {
    return (
      <div className={clsx('w-full h-full overflow-auto', className)}>
        <ErrorBoundary onError={(err) => setError(err.message)}>
          <Component />
        </ErrorBoundary>
      </div>
    );
  }

  return null;
}