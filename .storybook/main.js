module.exports = {
  stories: ['../storybook/**/*.stories.[tj]s'],
  addons: [
    '@storybook/addon-storysource/register',
    '@storybook/addon-actions/register',
    '@storybook/addon-notes/register',
    '@storybook/addon-viewport/register',
    '@storybook/addon-a11y/register',
    '@storybook/addon-docs',
    'storybook-dark-mode/register',
  ]
}
