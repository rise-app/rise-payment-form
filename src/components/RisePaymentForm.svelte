<script>
  // MODULES


  // COMPONENTS
  import CreditCard from './CreditCard.svelte'
  import Check from './Check.svelte'
  import ApplePay from './ApplePay.svelte'

  // IMPORTS
  export let
    rise = {},
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

  let cardValues = {
    card_name: card.card_name || '',
    card_number: card.card_number || '',
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
    // The gateway type to use: eg. rise, nexio, stripe etc
    gateway_type: card.gateway_type,
    // The card type if known or selected: eg. visa, mastercard
    card_type: card.card_type,
    // If some processing is happening from outside the component
    is_processing: card.is_processing,
    // Input Errors
    errors: card.errors || null,
    // Fields that are not allowed to be used
    disabled_fields: card.disabled_fields || [],
    // Text for the submit button
    submit_text: card.submit_text || 'Submit',
    // Labels
    card_number_label: card.card_number_label || 'Card Number',
    card_name_label: card.card_name_label || 'Card Holder',
    card_expiration_label: card.card_expiration_label || 'Expiration Date',
    card_cvv_label: card.card_cvv_label || 'CVV',

    // Security
    ip: card.ip
  }

</script>

<style>

</style>

{#if selected}
  <svelte:component this={selected.component} {rise} card={cardValues} {...formValues} on:token ></svelte:component>
{:else}
  Missing Payment Type: {type}
{/if}
