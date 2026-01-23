import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circle: 'rounded-full',
    rectangular: 'rounded',
  };

  const inlineStyle = {
    width: width
      ? typeof width === 'number'
        ? `${width}px`
        : width
      : undefined,
    height: height
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : undefined,
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={inlineStyle}
      {...props}
    />
  );
}

export function VaultItemSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
        <Skeleton variant="circle" width={32} height={32} />
      </div>
      <Skeleton variant="text" width="80%" height={14} />
    </div>
  );
}

export function VaultListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <VaultItemSkeleton key={index} />
      ))}
    </div>
  );
}
