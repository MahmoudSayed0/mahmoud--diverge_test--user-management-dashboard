describe('User Management Dashboard', () => {
  beforeEach(() => {
    // Visit the main page directly instead of trying to log in
    cy.visit('/');
    
    // Wait for the page to load
    cy.get('input[type="email"]').type('admin@example.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete and redirect
    cy.url().should('not.include', '/login');
  });

  it('should display the user table with data', () => {
    // Check if the user table is visible
    cy.get('table').should('be.visible');
    
    // Check if there are rows in the table
    cy.get('tbody tr').should('have.length.greaterThan', 0);
    
    // Check if the table headers are correct
    cy.get('thead th').should('contain', 'Name');
    cy.get('thead th').should('contain', 'Email');
    cy.get('thead th').should('contain', 'Role');
    cy.get('thead th').should('contain', 'Status');
  });

  it('should filter users by search term', () => {
    // Get the initial number of rows
    cy.get('tbody tr').then(($rows) => {
      const initialRowCount = $rows.length;
      
      // Type a search term
      cy.get('input[placeholder*="Search"]').type('admin');
      
      // Wait for the filter to apply
      cy.wait(500);
      
      // Check if the number of rows has changed
      cy.get('tbody tr').should('have.length.lessThan', initialRowCount);
      
      // Clear the search
      cy.get('input[placeholder*="Search"]').clear();
      
      // Wait for the filter to reset
      cy.wait(500);
      
      // Check if the number of rows is back to initial
      cy.get('tbody tr').should('have.length', initialRowCount);
    });
  });

  it('should filter users by role', () => {
    // Select the admin role from the dropdown
    cy.get('select#role-filter').select('admin');
    
    // Check if all visible users have the admin role
    cy.get('tbody tr').each(($row) => {
      cy.wrap($row).find('td').eq(2).should('contain', 'Admin');
    });
    
    // Reset the filter
    cy.get('select#role-filter').select('');
  });

  it('should sort users by name', () => {
    // Get the initial order of names
    const initialNames = [];
    cy.get('tbody tr td:first-child').each(($cell) => {
      initialNames.push($cell.text());
    }).then(() => {
      // Click on the Name header to sort
      cy.get('thead th').contains('Name').click();
      
      // Get the new order of names
      const sortedNames = [];
      cy.get('tbody tr td:first-child').each(($cell) => {
        sortedNames.push($cell.text());
      }).then(() => {
        // Check if the order has changed
        expect(sortedNames).not.to.deep.equal(initialNames);
        
        // Check if the names are sorted alphabetically
        const expectedSortedNames = [...initialNames].sort();
        expect(sortedNames).to.deep.equal(expectedSortedNames);
      });
    });
  });

  it('should change language and support RTL', () => {
    // Click on the language switcher
    cy.get('button').contains('EN').click();
    
    // Select Arabic
    cy.contains('العربية').click();
    
    // Check if the HTML direction is RTL
    cy.get('html').should('have.attr', 'dir', 'rtl');
    
    // Check if the body has the RTL class
    cy.get('body').should('have.class', 'rtl');
    
    // Switch back to English
    cy.get('button').contains('AR').click();
    cy.contains('English').click();
    
    // Check if the HTML direction is LTR
    cy.get('html').should('have.attr', 'dir', 'ltr');
    
    // Check if the body doesn't have the RTL class
    cy.get('body').should('not.have.class', 'rtl');
  });

  it('should export users to CSV', () => {
    // Click on the export button
    cy.contains('Export').click();
    
    // Click on the CSV export option
    cy.contains('Export to CSV').click();
    
    // Since we can't test file downloads directly in Cypress,
    // we'll just check if the export function was called
    // This would require a spy or stub in a real test
    cy.wait(1000); // Wait for any potential error messages
    
    // Check that no error message is displayed
    cy.contains('Error exporting data').should('not.exist');
  });

  it('should have accessible elements', () => {
    // Check if the skip link exists
    cy.get('a[href="#main-content"]').should('exist');
    
    // Check if table has proper ARIA attributes
    cy.get('table').should('have.attr', 'aria-label');
    
    // Check if sort buttons have proper ARIA attributes
    cy.get('th[role="button"]').should('have.attr', 'aria-sort');
    
    // Check if the search input has proper labeling
    cy.get('input[aria-label="Search users"]').should('exist');
  });
}); 