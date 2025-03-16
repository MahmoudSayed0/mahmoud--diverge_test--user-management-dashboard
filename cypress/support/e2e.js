// Import commands.js using CommonJS syntax
require('./commands');

// Add Testing Library commands
require('@testing-library/cypress/add-commands');

// Hide fetch/XHR requests in the command log
Cypress.on('window:before:load', (win) => {
  const app = win.top;
  if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
    const style = app.document.createElement('style');
    style.innerHTML =
      '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app.document.head.appendChild(style);
  }
}); 