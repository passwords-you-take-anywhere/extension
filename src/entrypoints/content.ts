import './autofill.css';

import type { VaultItem } from '@/types/vault';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  world: 'ISOLATED',
  main() {
    // Wait for body to be ready
    if (document.body) {
      initAutofill();
    } else {
      const bodyObserver = new MutationObserver(() => {
        if (document.body) {
          bodyObserver.disconnect();
          initAutofill();
        }
      });
      bodyObserver.observe(document.documentElement, { childList: true });
    }
  },
});

function initAutofill() {

  // Detect forms on page load
  detectAndAttachAutofill();

  // Watch for dynamic form additions (modals, popups, etc)
  const observer = new MutationObserver((mutations) => {
    detectAndAttachAutofill();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['type'],
  });
}

function detectAndAttachAutofill() {
  // Find password fields
  const passwordFields = document.querySelectorAll<HTMLInputElement>(
    'input[type="password"]'
  );

  passwordFields.forEach((passwordField) => {
    // Skip if already has autofill attached
    if (passwordField.dataset.pytaAutofill === 'true') return;
    passwordField.dataset.pytaAutofill = 'true';

    // Find associated username field (email or text input before password)
    const usernameField = findUsernameField(passwordField);


    if (usernameField) {
      // Skip if username field already has dropdown attached
      if (usernameField.dataset.pytaAttached === 'true') return;
      attachAutofillDropdown(usernameField, passwordField);
    }
  });
}

function findUsernameField(
  passwordField: HTMLInputElement
): HTMLInputElement | null {
  const form = passwordField.closest('form');
  const searchScope = form || document;

  // Look for email or text inputs (also check for autocomplete attributes)
  const candidates = Array.from(
    searchScope.querySelectorAll<HTMLInputElement>(
      'input[type="email"], input[type="text"], input:not([type])'
    )
  );


  // Find the closest input before the password field
  for (let i = candidates.length - 1; i >= 0; i--) {
    const candidate = candidates[i];

    // Skip hidden inputs
    if (candidate.offsetParent === null) continue;

    if (
      candidate.compareDocumentPosition(passwordField) &
      Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      return candidate;
    }
  }

  return null;
}

async function attachAutofillDropdown(
  usernameField: HTMLInputElement,
  passwordField: HTMLInputElement
) {
  // Disable browser autocomplete
  usernameField.setAttribute('autocomplete', 'off');
  passwordField.setAttribute('autocomplete', 'off');
  usernameField.setAttribute('data-pyta-attached', 'true');
  passwordField.setAttribute('data-pyta-attached', 'true');

  // Get matching credentials for current domain
  const credentials = await getMatchingCredentials();

  if (credentials.length === 0) return;

  // Create and show dropdown on focus
  const showDropdown = (e: FocusEvent) => {
    e.stopPropagation();
    showAutofillDropdown(usernameField, passwordField, credentials);
  };

  usernameField.addEventListener('focus', showDropdown);
  passwordField.addEventListener('focus', showDropdown);
}

async function getMatchingCredentials(): Promise<VaultItem[]> {
  try {
    const currentDomain = extractDomain(window.location.href);
    if (!currentDomain) return [];

    // Get vault from storage (already decrypted)
    const vaultData = await storage.getItem('local:vault');

    if (!vaultData) {
      return [];
    }

    // Vault items are already decrypted in storage
    const vault = vaultData as VaultItem[];

    // Filter matching items
    const matchingItems = vault.filter((item) => {
      if (item.deleted_at) return false;
      return item.domains.some((domain) => {
        const normalizedDomain = normalizeDomain(domain);
        return normalizedDomain === currentDomain;
      });
    });

    return matchingItems;
  } catch (error) {
    console.error('Error getting credentials:', error);
    return [];
  }
}

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return normalizeDomain(urlObj.hostname);
  } catch {
    return null;
  }
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, '');
}

function showAutofillDropdown(
  usernameField: HTMLInputElement,
  passwordField: HTMLInputElement,
  credentials: VaultItem[]
) {
  // Remove existing dropdown if any
  removeExistingDropdown();

  // Get current domain to display in dropdown
  const currentDomain = extractDomain(window.location.href);

  // Create dropdown
  const dropdown = createDropdown(credentials, usernameField, passwordField, currentDomain);

  // Position dropdown below username field
  positionDropdown(dropdown, usernameField);

  // Append to body
  document.body.appendChild(dropdown);

  // Close on click outside - delay to avoid immediate close from focus click
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside, true);
  }, 200);
}

function createDropdown(
  credentials: VaultItem[],
  usernameField: HTMLInputElement,
  passwordField: HTMLInputElement,
  currentDomain: string | null
): HTMLElement {
  const dropdown = document.createElement('div');
  dropdown.id = 'pyta-autofill-dropdown';

  credentials.forEach((credential) => {
    const item = document.createElement('div');
    item.className = 'pyta-dropdown-item';

    // Find the matching domain to display, default to first if not found
    let displayDomain = credential.domains[0] || '';
    if (currentDomain) {
      const matchingDomain = credential.domains.find((domain) => {
        return normalizeDomain(domain) === currentDomain;
      });
      if (matchingDomain) {
        displayDomain = matchingDomain;
      }
    }

    const usernameDiv = document.createElement('div');
    usernameDiv.className = 'pyta-dropdown-username';
    usernameDiv.textContent = credential.username_data;

    const domainDiv = document.createElement('div');
    domainDiv.className = 'pyta-dropdown-domain';
    domainDiv.textContent = displayDomain;

    item.appendChild(usernameDiv);
    item.appendChild(domainDiv);

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      fillCredentials(usernameField, passwordField, credential);
      removeExistingDropdown();
    });

    dropdown.appendChild(item);
  });

  return dropdown;
}

function positionDropdown(dropdown: HTMLElement, field: HTMLInputElement) {
  const rect = field.getBoundingClientRect();
  dropdown.style.top = `${rect.bottom + 2}px`;
  dropdown.style.left = `${rect.left}px`;
  dropdown.style.width = `${rect.width}px`;
}

function fillCredentials(
  usernameField: HTMLInputElement,
  passwordField: HTMLInputElement,
  credential: VaultItem
) {
  // Use native setter to bypass React/framework controls
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  // Fill username field
  usernameField.focus();
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(usernameField, credential.username_data);
  } else {
    usernameField.value = credential.username_data;
  }
  usernameField.dispatchEvent(new Event('input', { bubbles: true }));
  usernameField.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
  usernameField.dispatchEvent(new Event('change', { bubbles: true }));

  // Small delay before filling password field
  setTimeout(() => {
    passwordField.focus();
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(passwordField, credential.password_data);
    } else {
      passwordField.value = credential.password_data;
    }
    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
    passwordField.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    passwordField.dispatchEvent(new Event('change', { bubbles: true }));
  }, 50);
}

function removeExistingDropdown() {
  const existing = document.getElementById('pyta-autofill-dropdown');
  if (existing) {
    existing.remove();
    document.removeEventListener('click', handleClickOutside, true);
  }
}

function handleClickOutside(e: MouseEvent) {
  const dropdown = document.getElementById('pyta-autofill-dropdown');
  const target = e.target as Node;

  // Don't close if clicking inside dropdown or on input fields
  if (dropdown && !dropdown.contains(target)) {
    // Check if click is on username or password field
    const inputs = document.querySelectorAll('[data-pyta-autofill="true"]');
    let isInputClick = false;
    inputs.forEach((input) => {
      if (input === target || input.contains(target)) {
        isInputClick = true;
      }
    });

    if (!isInputClick) {
      removeExistingDropdown();
    }
  }
}
