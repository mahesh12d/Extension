// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "FILL_FORM") {
    fillForm(request.profile);
    sendResponse({ status: "success" });
  }
});

function fillForm(profile) {
  const inputs = document.querySelectorAll("input, select, textarea");
  
  inputs.forEach(input => {
    const type = input.type;
    if (type === "hidden" || type === "submit" || type === "button") return;

    // Fuzzy matching logic
    const keys = Object.keys(profile);
    const match = findMatch(input, keys);
    
    if (match) {
      const value = profile[match];
      if (value) {
        input.value = value;
        // Trigger events for React/Angular/Vue apps to register change
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}

function findMatch(input, keys) {
  const attributes = [
    input.name,
    input.id,
    input.placeholder,
    input.getAttribute('aria-label')
  ];

  // Also check associated label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) attributes.push(label.innerText);
  }

  const normalizedAttrs = attributes
    .filter(Boolean)
    .map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));

  for (const key of keys) {
    // Map DB keys to common form terms
    // e.g. "firstName" -> ["firstname", "fname", "givenname"]
    const terms = getTermsForKey(key);
    
    for (const term of terms) {
      for (const attr of normalizedAttrs) {
        if (attr.includes(term)) {
          return key;
        }
      }
    }
  }
  
  return null;
}

function getTermsForKey(key) {
  const mapping = {
    firstName: ["firstname", "fname", "givenname", "first"],
    lastName: ["lastname", "lname", "surname", "last", "familyname"],
    email: ["email", "mail", "e-mail"],
    phone: ["phone", "tel", "mobile", "cell"],
    address: ["address", "street", "addr"],
    city: ["city", "town"],
    zip: ["zip", "postal", "code"],
    country: ["country", "nation"],
    profileName: [] // Don't match profile name
  };
  
  return mapping[key] || [key.toLowerCase()];
}
