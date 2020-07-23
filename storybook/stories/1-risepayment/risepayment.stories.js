import { storiesOf } from '@storybook/svelte'
import RisePaymentForm from '../../../src/components/RisePaymentForm.svelte'
import RisePaymentPreview from '../../../src/components/RisePaymentPreview.svelte'
import markdownNotes from './risepayment.stories.md'

storiesOf('1 - Modules | RiSE Payment Form', module)
  // Credit Card
  .add(
    'RiSE Payment Form: Credit',
    () => ({
      Component: RisePaymentForm,
      props: {
      },
    }),
    { notes: { markdown: markdownNotes } },
  )
  // Credit Card Preview
  .add(
    'RiSE Payment Preview: Credit',
    () => ({
      Component: RisePaymentPreview,
      props: {
      },
    }),
    { notes: { markdown: markdownNotes } },
  )
