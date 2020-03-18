# RiSE Payment Form
Web components for RiSE Payment Forms and Previews.

[Looking for RiSE?](https://rise.store)

## Currently Supported RiSE:Payment Gateways:
 - Stripe
 - Nexio
 - Rave

All of these are enabled through using the RiSE:Payment application.
If you are testing your app's setup with the rise-payment-form, you'll want to make sure you have the Application Endpoints enabled for your channels.  Ask your TAM for more information.

## Development
This web component is developed using the amazing and lightweight [Svelte](https://svelte.dev/) framework which can be exported as a normal web component.
To run a local version of rise-payment-form, start with installing the node.js dependencies:

`npm install`

Then, start the local development server:

`npm run dev`

## Testing
These components use [Cypress](https://www.cypress.io/) & [testing-library](https://testing-library.com/docs/cypress-testing-library/intro) for testing.

It's recommend going through their docs if you intend on testing the components.

You can run the components tests with `npm run cy:open`.

## FAQ

[Find the most common FAQs here](../master/FAQ.md).

## Publishing to [npm](https://www.npmjs.com)

## Contributing

All contributions are welcome!

## License
This repository uses an [MIT License](../master/LICENSE). Like many of you, we value OSS!
