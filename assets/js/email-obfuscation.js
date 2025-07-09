// Email Obfuscation Script
(function() {
    'use strict';
    
    // Simple email scrambling function
    function scrambleEmail(email) {
        const parts = email.split('@');
        if (parts.length !== 2) return email;
        
        const local = parts[0];
        const domain = parts[1];
        
        // Scramble the local part by reversing it and adding some noise
        const scrambledLocal = local.split('').reverse().join('') + 'x' + Math.random().toString(36).substring(2, 4);
        
        // Scramble the domain by reversing it
        const scrambledDomain = domain.split('').reverse().join('');
        
        return scrambledLocal + '@' + scrambledDomain;
    }
    
    // Function to unscramble email
    function unscrambleEmail(scrambledEmail) {
        const parts = scrambledEmail.split('@');
        if (parts.length !== 2) return scrambledEmail;
        
        let local = parts[0];
        const domain = parts[1];
        
        // Remove the noise and reverse the local part
        local = local.replace(/x[a-z0-9]{2}$/, '');
        const unscrambledLocal = local.split('').reverse().join('');
        
        // Reverse the domain
        const unscrambledDomain = domain.split('').reverse().join('');
        
        return unscrambledLocal + '@' + unscrambledDomain;
    }
    
    // Initialize email obfuscation when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        const emailElements = document.querySelectorAll('.obfuscated-email');
        
        emailElements.forEach(function(element) {
            const realEmail = element.getAttribute('data-email');
            const scrambledEmail = scrambleEmail(realEmail);
            
            // Create the display elements
            const emailSpan = document.createElement('span');
            emailSpan.className = 'email-display';
            emailSpan.textContent = scrambledEmail;
            
            const unscrambleBtn = document.createElement('button');
            unscrambleBtn.className = 'unscramble-btn';
            unscrambleBtn.textContent = 'Unscramble Email';
            unscrambleBtn.style.cssText = `
                margin-left: 10px;
                padding: 4px 8px;
                background-color: #007acc;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.3s;
            `;
            
            // Add hover effect
            unscrambleBtn.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#005a9e';
            });
            
            unscrambleBtn.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '#007acc';
            });
            
            // Add click functionality
            unscrambleBtn.addEventListener('click', function() {
                emailSpan.textContent = realEmail;
                this.textContent = 'Email Revealed!';
                this.style.backgroundColor = '#28a745';
                this.disabled = true;
                
                // Optional: Add a copy to clipboard functionality
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(realEmail).then(function() {
                        setTimeout(function() {
                            unscrambleBtn.textContent = 'Copied!';
                        }, 1000);
                    });
                }
            });
            
            // Clear the element and add new content
            element.innerHTML = '';
            element.appendChild(emailSpan);
            element.appendChild(unscrambleBtn);
        });
    });
})(); 