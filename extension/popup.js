let emailVariations = [];
let currentDomain = '';

// Generate all possible dot variations for Gmail
function generateGmailVariations(email) {
    const parts = email.split('@');
    if (parts.length !== 2 || !parts[1].includes('gmail.com')) {
        alert('Please enter a valid Gmail address');
        return [];
    }

    const username = parts[0].replace(/\./g, ''); // Remove existing dots
    const domain = parts[1];
    const variations = new Set();
    
    // Add original without dots
    variations.add(username + '@' + domain);
    
    // Generate all possible dot positions
    const n = username.length - 1;
    
    // Use bit manipulation to generate all combinations
    for (let i = 1; i < (1 << n); i++) {
        let variant = username[0];
        
        for (let j = 0; j < n; j++) {
            if (i & (1 << j)) {
                variant += '.';
            }
            variant += username[j + 1];
        }
        
        variations.add(variant + '@' + domain);
    }
    
    return Array.from(variations).sort();
}

// Load saved data
async function loadData() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['emailData', 'currentIndex', 'domainQueues'], (result) => {
            resolve(result);
        });
    });
}

// Save data
async function saveData(data) {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, resolve);
    });
}

// Update UI with current data
async function updateUI() {
    const data = await loadData();
    
    if (data.emailData && data.emailData.variations) {
        emailVariations = data.emailData.variations;
        document.getElementById('results').style.display = 'block';
        document.getElementById('totalVariations').textContent = emailVariations.length;
        
        // Count used emails
        const usedCount = emailVariations.filter(email => email.used).length;
        document.getElementById('usedCount').textContent = usedCount;
        
        // Show current email
        const currentIndex = data.currentIndex || 0;
        if (emailVariations.length > 0) {
            document.getElementById('currentEmailSection').style.display = 'block';
            document.getElementById('currentEmail').textContent = emailVariations[currentIndex].email;
        }
        
        // Update domain list
        updateDomainList(data.domainQueues || {});
        
        // Populate email list
        populateEmailList();
    }
}

// Populate email list
function populateEmailList() {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = '';
    
    emailVariations.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'email-item';
        div.textContent = `${index + 1}. ${item.email} ${item.used ? '(used)' : ''}`;
        emailList.appendChild(div);
    });
}

// Update domain usage list
function updateDomainList(domainQueues) {
    const domainList = document.getElementById('domainList');
    domainList.innerHTML = '';
    
    if (Object.keys(domainQueues).length === 0) {
        domainList.innerHTML = '<p style="text-align: center; color: #999;">No domains tracked yet</p>';
        return;
    }
    
    for (const [domain, queue] of Object.entries(domainQueues)) {
        const div = document.createElement('div');
        div.className = 'domain-item';
        div.innerHTML = `
            <span class="domain-name">${domain}</span>
            <span class="domain-count">Email ${queue.currentIndex + 1} of ${queue.total}</span>
        `;
        domainList.appendChild(div);
    }
}

// Generate button click handler
document.getElementById('generateBtn').addEventListener('click', async () => {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    const variations = generateGmailVariations(email);
    
    if (variations.length === 0) {
        return;
    }
    
    // Create email data with usage tracking
    emailVariations = variations.map(email => ({
        email: email,
        used: false,
        usedOn: []
    }));
    
    // Save to storage
    await saveData({
        emailData: {
            originalEmail: email,
            variations: emailVariations,
            createdAt: new Date().toISOString()
        },
        currentIndex: 0,
        domainQueues: {}
    });
    
    // Update UI
    updateUI();
});

// Toggle email list visibility
document.getElementById('toggleListBtn').addEventListener('click', () => {
    const emailList = document.getElementById('emailList');
    const btn = document.getElementById('toggleListBtn');
    
    if (emailList.style.display === 'none' || emailList.style.display === '') {
        emailList.style.display = 'block';
        btn.textContent = 'Hide All Variations';
    } else {
        emailList.style.display = 'none';
        btn.textContent = 'Show All Variations';
    }
});

// Export data
document.getElementById('exportBtn').addEventListener('click', async () => {
    const data = await loadData();
    const exportData = {
        emailData: data.emailData,
        domainQueues: data.domainQueues,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail-variations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// Reset all data
document.getElementById('resetBtn').addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        await chrome.storage.local.clear();
        document.getElementById('results').style.display = 'none';
        document.getElementById('emailInput').value = '';
        alert('All data has been reset');
    }
});

// Copy current email button
document.getElementById('copyEmailBtn').addEventListener('click', async () => {
    const data = await loadData();
    if (data.emailData && data.emailData.variations) {
        const currentIndex = data.currentIndex || 0;
        const currentEmail = data.emailData.variations[currentIndex].email;
        
        // Copy to clipboard
        navigator.clipboard.writeText(currentEmail).then(() => {
            // Visual feedback
            const btn = document.getElementById('copyEmailBtn');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.style.backgroundColor = '#34a853';
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '#1a73e8';
            }, 1500);
            
            // Mark as used and advance
            data.emailData.variations[currentIndex].used = true;
            const newIndex = (currentIndex + 1) % data.emailData.variations.length;
            
            // Save updated data
            saveData({
                emailData: data.emailData,
                currentIndex: newIndex,
                domainQueues: data.domainQueues
            }).then(() => {
                updateUI();
            });
        });
    }
});

// Load data on popup open
document.addEventListener('DOMContentLoaded', updateUI);