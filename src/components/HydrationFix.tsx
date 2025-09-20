'use client';

import { useEffect } from 'react';
import { cleanupExtensionAttributes } from '@/lib/hydrationFix';

export default function HydrationFix() {
  useEffect(() => {
    // Run cleanup on client-side mount
    cleanupExtensionAttributes();
    
    // Also run after a short delay to catch extensions that load later
    const timeout1 = setTimeout(cleanupExtensionAttributes, 100);
    const timeout2 = setTimeout(cleanupExtensionAttributes, 500);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return null;
}
