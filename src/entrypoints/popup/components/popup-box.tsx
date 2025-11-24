import { PropsWithChildren } from 'react';

export default function PopupBox({ children }: PropsWithChildren) {
  return (
    <div className="w-sm h-96 flex flex-col justify-between dark bg-background text-foreground">
      {children}
    </div>
  );
}
