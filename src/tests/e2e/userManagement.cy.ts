describe('User Management Dashboard', () => {
  beforeEach(() => {
    // Visit the user management page
    cy.visit('/');
    
    // Wait for the page to load
    cy.contains('User Management Dashboard').should('be.visible');
  });

  it('displays the user list', () => {
    // Check if the table is visible
    cy.get('table').should('be.visible');
    
    // Check if there are users in the table
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('can filter users by search', () => {
    // Type in the search input
    cy.get('input[placeholder="Search users..."]').type('John');
    
    // Wait for the table to update
    cy.wait(500);
    
    // Check if the filtered results contain the search term
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('contain', 'John');
    });
  });

  it('can filter users by role', () => {
    // Open the role dropdown
    cy.contains('Role').parent().find('select').select('admin');
    
    // Wait for the table to update
    cy.wait(500);
    
    // Check if all users have the selected role
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).should('contain', 'Admin');
    });
  });

  it('can sort users by column', () => {
    // Click on the Name column header to sort
    cy.contains('Name').click();
    
    // Wait for the table to update
    cy.wait(500);
    
    // Get the first user name
    let firstUserName: string;
    cy.get('tbody tr').first().find('td').first().invoke('text').then((text) => {
      firstUserName = text;
      
      // Click again to reverse sort
      cy.contains('Name').click();
      
      // Wait for the table to update
      cy.wait(500);
      
      // Get the new first user name and verify it's different
      cy.get('tbody tr').first().find('td').first().invoke('text').should('not.eq', firstUserName);
    });
  });

  it('can navigate to user details', () => {
    // Click on the first user row
    cy.get('tbody tr').first().click();
    
    // Check if we navigated to the user details page
    cy.url().should('include', '/users/');
    
    // Check if the user details are displayed
    cy.contains('User Details').should('be.visible');
  });

  it('can add a new user', () => {
    // Click on the Add User button
    cy.contains('Add User').click();
    
    // Check if the create user form is displayed
    cy.contains('Create User').should('be.visible');
    
    // Fill in the form
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('select[name="role"]').select('editor');
    cy.get('select[name="status"]').select('active');
    
    // Submit the form
    cy.contains('Save').click();
    
    // Check if the user was added to the table
    cy.contains('Test User').should('be.visible');
  });

  it('shows pagination and can change page', () => {
    // Check if pagination is visible
    cy.contains('Showing').should('be.visible');
    
    // If there's more than one page, test pagination
    cy.get('button').contains('2').then(($btn) => {
      if ($btn.length > 0) {
        // Click on page 2
        cy.wrap($btn).click();
        
        // Wait for the table to update
        cy.wait(500);
        
        // Check if we're on page 2
        cy.contains('Showing').should('contain', 'page 2');
      }
    });
  });

  it('can change items per page', () => {
    // Get the current number of rows
    let initialRowCount: number;
    cy.get('tbody tr').its('length').then((count) => {
      initialRowCount = count;
      
      // Change items per page to 5
      cy.contains('Rows per page').parent().find('select').select('5');
      
      // Wait for the table to update
      cy.wait(500);
      
      // Check if the number of rows changed
      cy.get('tbody tr').its('length').should('be.lte', 5);
    });
  });
}); 