chrome.runtime.onInstalled.addListener((details) => {
    console.log('Gmail Variations Manager installed');
    
    // Initialize storage if needed
    chrome.storage.local.get(['emailData'], (result) => {
        if (!result.emailData) {
            chrome.storage.local.set({
                emailData: null,
                currentIndex: 0,
                domainQueues: {}
            });
        }
    });
    
    // Open welcome page on first install
    if (details.reason === 'install') {
        chrome.tabs.create({
            url: 'welcome.html'
        });
    }
});

// Handle messages from content scripts if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getNextEmail') {
        chrome.storage.local.get(['emailData', 'domainQueues'], (result) => {
            sendResponse(result);
        });
        return true; // Indicate async response
    }
});