// content.js - Handles email form detection and auto-fill
let currentDomain = window.location.hostname;
let emailInputs = [];
let isDebugMode = false; // Set to true to see console logs

function debugLog(...args) {
    if (isDebugMode) {
        console.log('[Gmail Variations]', ...args);
    }
}

// Find all email input fields on the page
function findEmailInputs() {
    // Broader selection to catch more email fields
    const inputs = document.querySelectorAll('input[type="email"], input[type="text"], input:not([type])');
    emailInputs = Array.from(inputs).filter(input => {
        const type = (input.type || '').toLowerCase();
        const name = (input.name || '').toLowerCase();
        const id = (input.id || '').toLowerCase();
        const placeholder = (input.placeholder || '').toLowerCase();
        const autocomplete = (input.autocomplete || '').toLowerCase();
        const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
        const className = (input.className || '').toLowerCase();
        
        // Check various attributes that might indicate an email field
        const isEmailField = type === 'email' || 
               name.includes('email') || 
               name.includes('username') ||
               name.includes('login') ||
               name.includes('user') ||
               id.includes('email') || 
               id.includes('username') ||
               id.includes('login') ||
               id.includes('user') ||
               placeholder.includes('email') ||
               placeholder.includes('@') ||
               placeholder.includes('username') ||
               autocomplete.includes('email') ||
               autocomplete.includes('username') ||
               ariaLabel.includes('email') ||
               className.includes('email') ||
               className.includes('username');
               
        if (isEmailField) {
            debugLog('Found email field:', {
                type, name, id, placeholder, autocomplete
            });
        }
        
        return isEmailField;
    });
    
    debugLog(`Found ${emailInputs.length} email inputs on ${currentDomain}`);
    return emailInputs;
}

// Add click listener to email inputs
function addEmailInputListeners() {
    emailInputs.forEach((input, index) => {
        // Remove existing listeners to avoid duplicates
        input.removeEventListener('focus', handleEmailInputFocus);
        input.removeEventListener('contextmenu', handleRightClick);
        
        // Add new listeners
        input.addEventListener('focus', handleEmailInputFocus);
        input.addEventListener('contextmenu', handleRightClick);
        
        // Add data attribute to track
        input.setAttribute('data-gmail-variations', 'true');
        
        debugLog(`Added listeners to input ${index}:`, input);
    });
}

// Handle email input focus
async function handleEmailInputFocus(event) {
    const input = event.target;
    debugLog('Email input focused:', input);
    
    // Check if we have email variations stored
    const data = await chrome.storage.local.get(['emailData', 'domainQueues']);
    
    if (!data.emailData || !data.emailData.variations) {
        debugLog('No email variations found');
        return;
    }
    
    // Get or create domain queue
    let domainQueues = data.domainQueues || {};
    
    if (!domainQueues[currentDomain]) {
        domainQueues[currentDomain] = {
            currentIndex: 0,
            total: data.emailData.variations.length
        };
        debugLog('Created new domain queue for:', currentDomain);
    }
    
    // Get current email for this domain
    const queue = domainQueues[currentDomain];
    const currentEmail = data.emailData.variations[queue.currentIndex];
    
    debugLog('Current email for domain:', currentEmail.email);
    
    // Show floating tooltip
    showTooltip(input, currentEmail.email, queue.currentIndex + 1, queue.total);
}

// Handle right-click to auto-fill and advance
async function handleRightClick(event) {
    event.preventDefault();
    const input = event.target;
    debugLog('Right-click on input:', input);
    
    // Get current data
    const data = await chrome.storage.local.get(['emailData', 'domainQueues']);
    
    if (!data.emailData || !data.emailData.variations) {
        alert('No email variations found. Please generate them first using the extension popup.');
        return;
    }
    
    let domainQueues = data.domainQueues || {};
    
    if (!domainQueues[currentDomain]) {
        domainQueues[currentDomain] = {
            currentIndex: 0,
            total: data.emailData.variations.length
        };
    }
    
    const queue = domainQueues[currentDomain];
    const currentEmail = data.emailData.variations[queue.currentIndex];
    
    debugLog('Filling with email:', currentEmail.email);
    
    // Fill the input - try multiple methods
    input.value = currentEmail.email;
    input.setAttribute('value', currentEmail.email);
    
    // Trigger various events to ensure the site recognizes the change
    const events = ['input', 'change', 'keyup', 'keydown', 'blur'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        input.dispatchEvent(event);
    });
    
    // For React/Vue/Angular sites
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, currentEmail.email);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Mark as used
    data.emailData.variations[queue.currentIndex].used = true;
    if (!data.emailData.variations[queue.currentIndex].usedOn) {
        data.emailData.variations[queue.currentIndex].usedOn = [];
    }
    data.emailData.variations[queue.currentIndex].usedOn.push({
        domain: currentDomain,
        timestamp: new Date().toISOString()
    });
    
    // Advance to next email
    queue.currentIndex = (queue.currentIndex + 1) % queue.total;
    domainQueues[currentDomain] = queue;
    
    debugLog('Advanced to index:', queue.currentIndex);
    
    // Save updated data
    await chrome.storage.local.set({
        emailData: data.emailData,
        domainQueues: domainQueues
    });
    
    // Show confirmation
    showConfirmation(input, `Filled: ${currentEmail.email}`);
}

// Show tooltip near input
function showTooltip(input, email, current, total) {
    // Remove existing tooltip
    const existing = document.getElementById('gmail-variation-tooltip');
    if (existing) {
        existing.remove();
    }
    
    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'gmail-variation-tooltip';
    tooltip.style.cssText = 'position: fixed; z-index: 2147483647;'; // Maximum z-index
    tooltip.innerHTML = `
        <div style="
            background: #1a73e8;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            max-width: 300px;
            pointer-events: none;
        ">
            <div style="font-weight: bold; margin-bottom: 4px;">Right-click to use:</div>
            <div style="font-family: monospace; word-break: break-all;">${email}</div>
            <div style="margin-top: 4px; opacity: 0.9;">Email ${current} of ${total} for ${currentDomain}</div>
        </div>
    `;
    
    // Position tooltip
    const rect = input.getBoundingClientRect();
    const tooltipDiv = tooltip.firstElementChild;
    tooltipDiv.style.position = 'fixed';
    tooltipDiv.style.left = `${Math.min(rect.left, window.innerWidth - 320)}px`;
    tooltipDiv.style.top = `${Math.max(10, rect.top - 80)}px`;
    
    document.body.appendChild(tooltip);
    
    // Remove tooltip when input loses focus
    input.addEventListener('blur', () => {
        setTimeout(() => {
            const tooltip = document.getElementById('gmail-variation-tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        }, 200);
    }, { once: true });
}

// Show confirmation message
function showConfirmation(input, message) {
    const confirmation = document.createElement('div');
    confirmation.style.cssText = 'position: fixed; z-index: 2147483647;';
    confirmation.innerHTML = `
        <div style="
            background: #34a853;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            pointer-events: none;
        ">${message}</div>
    `;
    
    const rect = input.getBoundingClientRect();
    const confirmDiv = confirmation.firstElementChild;
    confirmDiv.style.position = 'fixed';
    confirmDiv.style.left = `${rect.left}px`;
    confirmDiv.style.top = `${rect.bottom + 5}px`;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.remove();
    }, 2000);
}

// Initialize on page load
function initialize() {
    // Update current domain
    currentDomain = window.location.hostname;
    debugLog('Initializing on domain:', currentDomain);
    
    findEmailInputs();
    addEmailInputListeners();
    
    // Re-scan for new inputs periodically
    setInterval(() => {
        findEmailInputs();
        addEmailInputListeners();
    }, 1000);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Listen for dynamic content changes
const observer = new MutationObserver((mutations) => {
    // Check if new nodes were added
    const hasNewNodes = mutations.some(mutation => 
        mutation.addedNodes.length > 0
    );
    
    if (hasNewNodes) {
        findEmailInputs();
        addEmailInputListeners();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Re-initialize when navigating to new pages (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        currentDomain = window.location.hostname;
        debugLog('URL changed, reinitializing for:', currentDomain);
        setTimeout(initialize, 500); // Small delay for page to load
    }
}).observe(document, {subtree: true, childList: true});

// Listen for messages from popup to force re-scan
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'rescan') {
        debugLog('Forced rescan requested');
        initialize();
        sendResponse({found: emailInputs.length});
    }
});