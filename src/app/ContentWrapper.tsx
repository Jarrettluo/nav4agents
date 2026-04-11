'use client';

import { usePathname } from 'next/navigation';

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-[1200px] mx-auto pt-6 px-4 md:px-6">
      {children}
    </div>
  );
}
