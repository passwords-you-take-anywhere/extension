import { PropsWithChildren } from 'react';

export default function PopupBox({ children }: PropsWithChildren) {
  return (
    <div className="min-w-xs min-h-128 flex flex-col justify-between dark bg-background text-foreground">
      {children}
    </div>
  );
}
