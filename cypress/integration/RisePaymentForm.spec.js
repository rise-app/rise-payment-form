/// <reference types="Cypress" />

context('Actions', () => {
	beforeEach(() => {
		cy.visit('http://localhost:5000');
	});

	it('Should have Card Payment Form', () => {
		// cy.findByText('Hello world!').should('exist');
    cy.get('.card-form').should('exist')
	});
});
