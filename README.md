# RiSE Payment Form
Pre-built Web components for RiSE Payment Gateway Forms and Previews.

Welcome to the RiSE Payment Form! This web component can be used to safely and securely communicate with RiSE and your Payment Gateway.

>[Looking for RiSE?](https://rise.store)
>[Looking for the RiSE UI Kit?](https://github.com/rise-app/rise-ui)
>[Looking for the RiSE JS SDK?](https://github.com/rise-app/rise-sdk-js)

## What is RiSE?
 RiSE is an Application Platform as a Service unlike anything else. Please visit the [RiSE Website](https://rise.store) for more information.

## Currently Supported RiSE:Payment Gateways:
 - RiSE:Pay
 - Stripe
 - Nexio
 - Fluid Pay (Coming Soon)
 - Rave (Coming Soon)
 - Apple Pay (Coming Soon)

All of these are enabled through using the RiSE:Payment application.
If you are testing your app's setup with the rise-payment-form, you'll want to make sure you have the Gateway Application Endpoints enabled for your channels.  Ask your TAM for more information.

## Usage
Refer to the documentation to use the RiSE Payment Form, however, you may be able to get started in your current Svelte application with:

```shell
npm install @rise/payment-form --save
```

For other implementations, see the documentation.

## Development
These web components' development uses the amazing and lightweight [Svelte](https://svelte.dev/) framework which can be exported as a normal web component.
To run a local version of `rise-payment-form`, clone this repository and start with installing the node.js dependencies:

```shell
npm install
```

Then, start the local development server:

```shell
npm run dev
```

## Storybook
To run the Storybook

```shell
npm run stories
```

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
