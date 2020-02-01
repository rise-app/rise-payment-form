<script>
  // MODULES


  // COMPONENTS
  import CreditCard from './CreditCard.svelte'
  import Check from './Check.svelte'
  import ApplePay from './ApplePay.svelte'

  // IMPORTS
  export let
    type = 'card',
    card = {},
    check = {},
    apple = {}

  // LOGIC
  const options = [
    {name: 'card', component: CreditCard},
    {name: 'check', component: Check},
    {name: 'apple', component: ApplePay}
  ]

  let selected = options.find(o => o.name === type)

</script>

<style>

</style>

{#if selected}
  <svelte:component this={selected.component} {...card} on:token ></svelte:component>
{:else}
  Missing Payment Type
{/if}
