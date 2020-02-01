<script>
  // MODULES

  // COMPONENTS
  import CreditCardPreview from './CreditCardPreview.svelte'
  // import Check from './Check.svelte'
  // import ApplePay from './ApplePay.svelte'

  // IMPORTS
  export let
    type = 'card',
    card = {},
    check = {},
    apple = {}

  // LOGIC
  const options = [
    {name: 'card', component: CreditCardPreview},
    // {name: 'check', component: Check},
    // {name: 'apple', component: ApplePay}
  ]

  let selected = options.find(o => o.name === type)

</script>

<style>

</style>

{#if selected}
  <svelte:component this={selected.component} {...card} ></svelte:component>
{:else}
  Missing Payment Type
{/if}
