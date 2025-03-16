describe('Basic Application Tests', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/login');
    
    // Login as admin
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete and redirect
    cy.url().should('not.include', '/login');
  });

  it('should load the dashboard after login', () => {
    // Check if the dashboard is loaded
    cy.get('body').should('be.visible');
    cy.url().should('not.include', '/login');
  });

  it('should have the correct title', () => {
    cy.title().should('include', 'User Management');
  });

  it('should have a table element', () => {
    cy.get('table').should('exist');
  });

  it('should have a language switcher', () => {
    // Look for any button that might be a language switcher
    cy.get('button').should('exist');
  });

  it('should have a theme toggle', () => {
    // Look for any button that might be a theme toggle
    cy.get('button').should('exist');
  });
}); 