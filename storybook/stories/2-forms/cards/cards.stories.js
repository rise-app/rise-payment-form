import { storiesOf } from '@storybook/svelte'
import { action } from '@storybook/addon-actions'
import CreditCard from '../../../../src/components/CreditCard.svelte'
import CreditCardPreview from '../../../../src/components/CreditCardPreview.svelte'
import markdownNotes from './cards.stories.md'

storiesOf('2 - Forms | Cards', module)
  // Credit Card
  .add(
    'Credit Card',
    () => ({
      Component: CreditCard,
      props: {
      },
    }),
    { notes: { markdown: markdownNotes } },
  )
  // Credit Card Preview
  .add(
    'Credit Card Preview',
    () => ({
      Component: CreditCardPreview,
      props: {
      },
    }),
    { notes: { markdown: markdownNotes } },
  )
