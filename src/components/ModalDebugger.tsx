import { useEffect } from 'react';

/**
 * Debug component to detect and log any fixed overlay elements
 * This helps identify rogue modals or overlays causing darkening issues
 */
export const ModalDebugger = () => {
  useEffect(() => {
    const checkOverlays = () => {
      const overlays = document.querySelectorAll('.fixed.inset-0, [class*="fixed"][class*="inset-0"]');
      if (overlays.length > 0) {
        console.warn(`⚠️ Found ${overlays.length} overlay element(s):`, overlays);
        overlays.forEach((el, index) => {
          console.log(`Overlay ${index + 1}:`, {
            element: el,
            classes: el.className,
            zIndex: window.getComputedStyle(el).zIndex,
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility
          });
        });
      }
    };

    // Check on mount
    checkOverlays();

    // Check whenever DOM changes
    const observer = new MutationObserver(checkOverlays);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Global escape key to force close all modals
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const overlays = document.querySelectorAll('.fixed.inset-0');
        if (overlays.length > 0) {
          console.log('🔴 Force closing', overlays.length, 'overlay(s) with Escape key');
          overlays.forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return null;
};
