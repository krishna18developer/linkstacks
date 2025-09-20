/**
 * Utility to fix hydration issues caused by browser extensions
 * that add attributes to the DOM after server rendering
 */

export function cleanupExtensionAttributes() {
  if (typeof window === 'undefined') return;

  // Common attributes added by browser extensions
  const extensionAttributes = [
    'bis_register',
    '__processed_',
    'data-lastpass-icon-root',
    'data-1password-root',
    'data-bitwarden-watching',
    'data-dashlane-rid',
    'data-lastpass-root',
    'data-1password-root',
    'data-1password-ignore',
    'data-lastpass-ignore',
    'data-bitwarden-ignore',
    'data-dashlane-ignore',
  ];

  // Clean up body attributes
  const body = document.body;
  if (body) {
    extensionAttributes.forEach(attr => {
      if (attr.includes('__processed_')) {
        // Handle dynamic attributes that start with __processed_
        const attributes = Array.from(body.attributes);
        attributes.forEach(attribute => {
          if (attribute.name.startsWith('__processed_')) {
            body.removeAttribute(attribute.name);
          }
        });
      } else if (body.hasAttribute(attr)) {
        body.removeAttribute(attr);
      }
    });
  }

  // Clean up html attributes
  const html = document.documentElement;
  if (html) {
    extensionAttributes.forEach(attr => {
      if (attr.includes('__processed_')) {
        const attributes = Array.from(html.attributes);
        attributes.forEach(attribute => {
          if (attribute.name.startsWith('__processed_')) {
            html.removeAttribute(attribute.name);
          }
        });
      } else if (html.hasAttribute(attr)) {
        html.removeAttribute(attr);
      }
    });
  }
}

// Run cleanup on client-side mount
export function useHydrationFix() {
  if (typeof window !== 'undefined') {
    // Run immediately
    cleanupExtensionAttributes();
    
    // Also run after a short delay to catch extensions that load later
    setTimeout(cleanupExtensionAttributes, 100);
    setTimeout(cleanupExtensionAttributes, 500);
  }
}
