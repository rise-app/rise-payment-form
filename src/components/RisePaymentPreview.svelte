<script>
  // MODULES

  // COMPONENTS
  import CreditCardPreview from './CreditCardPreview.svelte'
  // import Check from './Check.svelte'
  // import ApplePay from './ApplePay.svelte'

  // IMPORTS
  export let
    rise = {},
    type = 'card',
    card = {},
    check = {},
    nexio = {},
    stripe = {},
    rave = {},
    apple = {}

  // LOGIC
  const options = [
    {name: 'card', component: CreditCardPreview},
    // {name: 'check', component: Check},
    // {name: 'apple', component: ApplePay}
  ]

  let selected = options.find(o => o.name === type)

  let cardValues = {
    card_name: card.card_name || '',
    card_number: card.card_number || '',
    card_number_last: card.card_number_last || '',
    card_year: card.card_year || '',
    card_month: card.card_month || '',
    card_cvv: card.card_cvv || '',
    card_currency: card.card_currency || 'USD',
    email: card.email || '',
    phone: card.phone || '',
    address_1: card.address_1 || '',
    address_2: card.address_2 || '',
    address_3: card.address_3 || '',
    city: card.city || '',
    postal_code: card.postal_code || '',
    province_code: card.province_code || '',
    country_code: card.country_code || ''
  }

  let formValues = {
    gateway_type: card.gateway_type,
    card_type: card.card_type,
    is_processing: card.is_processing,
    errors: card.errors,
    editable_fields: card.editable_fields,
    can_edit: card.can_edit
  }

</script>

<style>

</style>

{#if selected}
  <svelte:component
    this={selected.component}
    {rise}
    {nexio}
    {apple}
    {stripe}
    {rave}
    card={cardValues}
    {...formValues}
    on:edit
  ></svelte:component>
{:else}
  Missing Payment Type: {type}
{/if}
