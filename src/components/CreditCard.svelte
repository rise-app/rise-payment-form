<script>
  // MODULES
  import { onMount, createEventDispatcher } from 'svelte'
  import { form, bindClass } from 'svelte-forms'
  import { fly } from 'svelte/transition'
  import { spring } from 'svelte/motion'

  import {
    rise as riseModule,
    rave as raveModule,
    nexio as nexioModule,
    stripe as stripeModule,
    apple as appleModule
  } from '../modules'

  // IMPORTS
  export let
    // The standard RISE details eg. channel_uuid, session, token, etc.
    rise = {},
    // RiSE ChannelCart
    cart = {},
    // RiSE ChannelCustomer
    customer = {},


    // Available Gateways to use
    nexio = {},
    stripe = {},
    rave = {},
    apple = {},

    // If something is already happening
    is_processing = false,

    // The gateway to use
    gateway_type = 'rise',

    // Will be set if not set
    card_type,

    // The card Object
    card = {
      // Required Fields
      card_name: '',
      card_number: '',
      card_month: '',
      card_year: '',
      card_cvv: '',
      card_currency: '',

      // Optional Fields based on Gateway
      email: null,
      phone: null,
      address_1: null,
      address_2: null,
      address_3: null,
      city: null,
      postal_code: null,
      province_code: null,
      country_code: null,
    },

    // Input Errors
    errors = null,
    submit_text = 'Submit',
    disabled_fields = [],
    card_number_label = 'Card Number',
    card_name_label = 'Card Holder',
    card_expiration_label = 'Expiration Date',
    card_cvv_label = 'CVV',

    // Security
    ip

  // LOGIC
  const dispatch = createEventDispatcher()

  /**
   * Card Validation Form
   */
  const cardForm = form(() => ({
    card_number: {
      value: card.card_number,
      validators: ['required', 'min:16', 'max:17'],
      // enabled: false
    },
    card_name: {
      value: card.card_name,
      validators: ['required', 'min:3'],
      // enabled: true
    },
    card_month: {
      value: card.card_month,
      validators: ['required', 'equal:2'],
      // enabled: true
    },
    card_year: {
      value: card.card_year,
      validators: ['required', 'equal:4'],
      // enabled: true
    },
    card_cvv: {
      value: card.card_cvv,
      validators: ['required', 'between:3:4'],
      // enabled: true
    },
    email: {
      value: card.email,
      validators: []
    },
    phone: {
      value: card.phone,
      validators: []
    },
    address_1: {
      value: card.address_1,
      validators: []
    },
    address_2: {
      value: card.address_2,
      validators: []
    },
    address_3: {
      value: card.address_3,
      validators: []
    },
    city: {
      value: card.city,
      validators: []
    },
    postal_code: {
      value: card.postal_code,
      validators: []
    },
    province_code: {
      value: card.province_code,
      validators: []
    },
    country_code: {
      value: card.country_code,
      validators: []
    }
  }),
  {
    stopAtFirstError: false,
    initCheck: true
  })

  // DOM controlling variables
  let currentCardBackground = Math.floor(Math.random()* 25 + 1)
  let minCardMonth
  let minCardYear = new Date().getFullYear()
  let amexCardMask = '#### ###### #####'
  let otherCardMask = '#### #### #### ####'
  let isCardFlipped = false
  let focusElementStyle = null
  let isInputFocused = false
  let refs = {}
  let cardNumberMask
  let submitTextOrg = (' ' + submit_text).slice(1)

  // Visibility Variables
  let
    disabled = false,
    btnDisabled = false,
    canEditNumber = true,
    canEditName = true,
    canEditMonth = true,
    canEditYear = true,
    canEditCvv = true,
    showPostal = false,
    showCountry = false,
    showProvince = false,
    showEmail = false,
    showPhone = false,
    cardYear

  // From var to Message ENUM
  const ERROR_MESSAGES = {
    'fraud': 'Unable to process at this time, please contact customer service',
    'invalid_cvc': 'Invalid CVC',
    'invalid_request': 'Invalid Request, missing fields required',
    'invalid_currency': 'Invalid Currency, please contact customer service',
    'avs_failed': 'Verify AVS Failed',
    'unable_to_process': 'Invalid Gateway, please contact customer service',
    'unknown': 'Unknown Error Occurred, contact customer service',
  }

  // Available Gateways
  const GATEWAYS = {
    'rise': null,
    'nexio': null,
    'rave': null,
    'apple': null,
    'stripe': null
  }

  const GATEWAY_CONFIGS = {
    'rise': rise,
    'nexio': nexio,
    'rave': rave,
    'apple': apple,
    'stripe': stripe
  }

  let selectedGateway // = GATEWAYS[gateway_type]
  let selectedGatewayConfig // = GATEWAY_CONFIGS[gateway_type]

  onMount(async function() {

    GATEWAYS.rise = riseModule
    GATEWAYS.nexio = nexioModule
    GATEWAYS.apple = appleModule
    GATEWAYS.stripe = stripeModule
    GATEWAYS.rave = raveModule

    selectedGateway = GATEWAYS[gateway_type]
    selectedGatewayConfig = GATEWAY_CONFIGS[gateway_type]
    document.getElementById('card_number').focus()

  })

  // Disable the submit button if not valid, and is processing
  $: disabled = ($cardForm.dirty && !$cardForm.valid) || is_processing || btnDisabled
  $: canEditNumber = !is_processing || disabled_fields.includes('card_number')
  $: canEditName = !is_processing || disabled_fields.includes('card_name')
  $: canEditMonth = !is_processing || disabled_fields.includes('card_month')
  $: canEditYear = !is_processing || disabled_fields.includes('card_year')
  $: canEditCvv = !is_processing || disabled_fields.includes('card_cvv')

  $: {

    // Set the card_type
    if (card.card_number.match(new RegExp("^(34|37)")) != null) {
      card_type = "amex"
    }
    else if (card.card_number.match(new RegExp("^5[1-5]")) != null) {
      card_type = "mastercard"
    }
    else if (card.card_number.match(new RegExp("^6011")) != null) {
      card_type = "discover"
    }
    else if (card.card_number.match(new RegExp("^4")) != null) {
      card_type = "visa"
    }
    // default type
    else {
      card_type = "rise"
    }

    // Set the min card month as the current month of the currnet year
    minCardMonth = card.card_year === minCardYear
      ? new Date().getMonth() + 1
      : 1
    // Set mask type
    cardNumberMask = card_type === "amex"
      ? amexCardMask
      : otherCardMask

    // Credit card input masking
    for (let index = 0; index < card.card_number.length; index++) {
      if (cardNumberMask[index] == ' ' && card.card_number[index] !== ' ') {
        card.card_number = card.card_number.substr(0, index) + ' ' + card.card_number.substr(index, card.card_number.length-index)
      }
    }
    if (card.card_number.substr('-1') == ' ') {
      card.card_number = card.card_number.substr(0, card.card_number.length-1)
    }
    card.card_number = card.card_number.substr(0, cardNumberMask.length).replace(/[^0-9 ]/g, '')

    // Set the card month on change if it is less than the current month of the current year
    if (card.card_month < minCardMonth ) {
      card.card_month = ''
    }
  }

  /**
   * Force the input
   * @param e
   */
  function focusInput(e) {
    isInputFocused = true

    let targetRef = e.target.dataset.ref
    let target = refs[targetRef]

    focusElementStyle = `opacity: 1;width: ${target.offsetWidth}px;height: ${target.offsetHeight}px;transform: translateX(${target.offsetLeft}px) translateY(${target.offsetTop}px)`
  }

  /**
   * Blur the input, delay for smoothingx
   */
  function blurInput() {
    setTimeout(() => {
      if (!isInputFocused) {
        focusElementStyle = null
      }
    }, 300)
    isInputFocused = false
  }

  function processing() {
    is_processing = true
    submit_text = 'Processing...'
  }
  function notProcessing() {
    is_processing = false
    submit_text = submitTextOrg
  }

  function transformErrors(errors = []) {

    return errors.map(v => {
      const key = Object.keys(v)[0]
      return {
        error: key,
        message: v[key] ? v[key] : ERROR_MESSAGES[key]
      }
    })
  }

  /**
   * Submit the Card to the Selected Gateway
   * @param event
   */
  async function submit(event) {
    processing()

    return selectedGateway.submit(rise, selectedGatewayConfig, cart, customer, {
      // Form Values
      ...card,
      // Additional Relative Card Data
      card_type,
      ip,
    })
    .then(res => {
      return complete(res)
    })
    .catch(err => {
      return failed(err)
    })
  }

  function failed(err) {
    notProcessing()
    submit_text = 'Retry'
    errors = transformErrors(err.errors)
    return dispatch('failed', errors)
  }

  function success(res) {
    return dispatch('success', res.success)
  }
  function token(res) {
    return dispatch('token', res.token)
  }

  function complete(event) {
    notProcessing()
    submit_text = 'Submitted!'
    btnDisabled = true
    token(event)
    success(event)
    return
  }

</script>


<style>
  @import url("https://fonts.googleapis.com/css?family=Source+Code+Pro:400,500,600,700|Source+Sans+Pro:400,600,700&display=swap");

  * {
    box-sizing: border-box;
  }
  *:focus {
    outline: none;
  }

  .wrapper {
    min-height: 100vh;
    display: flex;
    padding: 50px 15px;
  }
  @media screen and (max-width: 700px), (max-height: 500px) {
    .wrapper {
      flex-wrap: wrap;
      flex-direction: column;
    }
  }

  .card-form {
    max-width: 570px;
    margin: auto;
    width: 100%;
  }
  @media screen and (max-width: 576px) {
    .card-form {
      margin: 0 auto;
    }
  }

  .card-form-error-container {
    transition: all 0.4s ease;
  }

  .card-form-error-container__errors {
    background: var(--white, #fff);
    box-shadow: 0 30px 60px 0 rgba(90, 116, 148, 0.4);
    border-radius: 10px;
    color: var(--alert, #d80008);
    padding: 35px;
    margin-bottom: 50px;
    margin-top: 0px;
    position: relative;
  }
  .card-form-error-container__errors > .card-form-error-container__errors__error {

  }

  .card-form__inner {
    background: var(--white, #fff);
    box-shadow: 0 30px 60px 0 rgba(90, 116, 148, 0.4);
    border-radius: 10px;
    padding: 35px;
    padding-top: 180px;
  }
  @media screen and (max-width: 480px) {
    .card-form__inner {
      padding: 25px;
      padding-top: 165px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-form__inner {
      padding: 15px;
      padding-top: 165px;
    }
  }
  .card-form__row {
    display: flex;
    align-items: flex-start;
  }
  @media screen and (max-width: 480px) {
    .card-form__row {
      flex-wrap: wrap;
    }
  }
  .card-form__col {
    flex: auto;
    margin-right: 35px;
  }
  .card-form__col:last-child {
    margin-right: 0;
  }
  @media screen and (max-width: 480px) {
    .card-form__col {
      margin-right: 0;
      flex: unset;
      width: 100%;
      margin-bottom: 20px;
    }
    .card-form__col:last-child {
      margin-bottom: 0;
    }
  }
  .card-form__col.cvv {
    max-width: 150px;
  }
  @media screen and (max-width: 480px) {
    .card-form__col.cvv {
      max-width: initial;
    }
  }
  .card-form__group {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    position: relative;
  }
  .card-form__group .card-input__input {
    flex: 1;
    margin-right: 15px;
  }
  .card-form__group .card-input__input:last-child {
    margin-right: 0;
  }

  .card-form__button {
    position: relative;
    display: block;
    color: #fff;
    transition: all 0.4s ease;
    width: 100%;
    margin-top: 20px;
    background: var(--primary, #2364d2);
    box-shadow: 3px 10px 20px 0px rgba(35, 100, 210, 0.3);
    border-radius: 5px;
    height: 55px;
    overflow: hidden;
  }

  .card-form__button:not(.active) {
    cursor: pointer;
  }

  .card-form__button > .btn {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    line-height: 50px;
    text-align: center;
    z-index: 10;
    opacity: 1;

    width: 100%;
    height: 55px;
    border: none;
    font-size: 22px;
    font-weight: 500;
    font-family: "Source Sans Pro", sans-serif;
    color: var(--white, #fff);
    cursor: pointer;
    background: transparent;
  }
  @media screen and (max-width: 480px) {
    .card-form__button > .btn {
      margin-top: 10px;
    }
  }

  .card-form__button > .btn:disabled {
    color: var(--gray-300, #cccccc);
  }

  .card-form__button > .btn > .btn__text {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
  }

  .card-form__button .progress {
    width: 0%;
    z-index: 5;
    background: var(--primary, #2364d2);
    opacity: 0;
    transition: all 0.3s ease;
  }

  .card-form__button.active {
    background: #6899d2;
  }
  .card-form__button.active > .progress {
    opacity: 1;
    animation: progress-anim 10s ease 0s;
  }

  .card-form__button[data-progress-style='fill-back'] .progress {
    height: 55px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }

  @keyframes progress-anim {
    0% {
      width: 0%;
    }
    5% {
      width: 0%;
    }
    10% {
      width: 15%;
    }
    30% {
      width: 40%;
    }
    50% {
      width: 55%;
    }
    80% {
      width: 100%;
    }
    95% {
      width: 100%;
    }
    100% {
      width: 0%;
    }
  }

  .card-item {
    max-width: 430px;
    height: 270px;
    margin-left: auto;
    margin-right: auto;
    position: relative;
    z-index: 2;
    width: 100%;
  }
  @media screen and (max-width: 480px) {
    .card-item {
      max-width: 310px;
      height: 220px;
      width: 90%;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item {
      height: 180px;
    }
  }
  .card-item.active .card-item__side.front {
    transform: perspective(1000px) rotateY(180deg) rotateX(0deg) rotateZ(0deg);
  }
  .card-item.active .card-item__side.back {
    transform: perspective(1000px) rotateY(0) rotateX(0deg) rotateZ(0deg);
  }
  .card-item__focus {
    position: absolute;
    z-index: 3;
    border-radius: 5px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: all 0.35s cubic-bezier(0.71, 0.03, 0.56, 0.85);
    opacity: 0;
    pointer-events: none;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.65);
  }
  .card-item__focus:after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    background: var(--gray-900, #08142f);
    height: 100%;
    border-radius: 5px;
    filter: blur(25px);
    opacity: 0.5;
  }
  .card-item__focus.active {
    opacity: 1;
  }
  .card-item__side {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 20px 60px 0 rgba(14, 42, 90, 0.55);
    transform: perspective(2000px) rotateY(0deg) rotateX(0deg) rotate(0deg);
    transform-style: preserve-3d;
    transition: all 0.8s cubic-bezier(0.71, 0.03, 0.56, 0.85);
    backface-visibility: hidden;
    height: 100%;
  }
  .card-item__side.back {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: perspective(2000px) rotateY(-180deg) rotateX(0deg) rotate(0deg);
    z-index: 2;
    padding: 0;
    height: 100%;
  }
  .card-item__side.back .card-item__cover {
    transform: rotateY(-180deg);
  }
  .card-item__bg {
    max-width: 100%;
    display: block;
    max-height: 100%;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
  .card-item__cover {
    height: 100%;
    background-color: var(--black, #1c1d27);
    position: absolute;
    height: 100%;
    background-color: var(--black, #1c1d27);
    left: 0;
    top: 0;
    width: 100%;
    border-radius: 15px;
    overflow: hidden;
  }
  .card-item__cover:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(6, 2, 29, 0.45);
  }
  .card-item__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 40px;
    padding: 0 10px;
  }
  @media screen and (max-width: 480px) {
    .card-item__top {
      margin-bottom: 25px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__top {
      margin-bottom: 15px;
    }
  }
  .card-item__chip {
    width: 60px;
  }
  @media screen and (max-width: 480px) {
    .card-item__chip {
      width: 50px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__chip {
      width: 40px;
    }
  }
  .card-item__type {
    height: 45px;
    position: relative;
    display: flex;
    justify-content: flex-end;
    max-width: 100px;
    margin-left: auto;
    width: 100%;
  }
  @media screen and (max-width: 480px) {
    .card-item__type {
      height: 40px;
      max-width: 90px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__type {
      height: 30px;
    }
  }
  .card-item__typeImg {
    position: absolute;
    max-width: 100%;
    object-fit: contain;
    max-height: 100%;
    object-position: top right;
  }
  .card-item__info {
    color: var(--white, #fff);
    width: 100%;
    max-width: calc(100% - 85px);
    padding: 10px 15px;
    font-weight: 500;
    display: block;
    cursor: pointer;
  }
  @media screen and (max-width: 480px) {
    .card-item__info {
      padding: 10px;
    }
  }
  .card-item__holder {
    opacity: 0.7;
    font-size: 13px;
    margin-bottom: 6px;
  }
  @media screen and (max-width: 480px) {
    .card-item__holder {
      font-size: 12px;
      margin-bottom: 5px;
    }
  }
  .card-item__wrapper {
    font-family: "Source Code Pro", monospace;
    padding: 25px 15px;
    position: relative;
    z-index: 4;
    height: 100%;
    text-shadow: 7px 6px 10px rgba(14, 42, 90, 0.8);
    userselect: none;
  }
  @media screen and (max-width: 480px) {
    .card-item__wrapper {
      padding: 20px 10px;
    }
  }
  .card-item__name {
    font-size: 18px;
    line-height: 1;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: uppercase;
  }
  @media screen and (max-width: 480px) {
    .card-item__name {
      font-size: 16px;
    }
  }
  .card-item__nameItem {
    display: inline-block;
    min-width: 8px;
    position: relative;
  }
  .card-item__number {
    font-weight: 500;
    line-height: 1;
    color: var(--white, #fff);
    font-size: 27px;
    margin-bottom: 35px;
    display: inline-block;
    padding: 10px 15px;
    cursor: pointer;
  }
  @media screen and (max-width: 480px) {
    .card-item__number {
      font-size: 21px;
      margin-bottom: 15px;
      padding: 10px 10px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__number {
      font-size: 19px;
      margin-bottom: 10px;
      padding: 10px 10px;
    }
  }
  .card-item__numberItem {
    width: 16px;
    display: inline-block;
    vertical-align: top;
  }
  .card-item__numberItem span {
    position: absolute;
  }
  .card-item__numberItem.active {
    width: 30px;
  }
  @media screen and (max-width: 480px) {
    .card-item__numberItem {
      width: 13px;
    }
    .card-item__numberItem.active {
      width: 16px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__numberItem {
      width: 12px;
    }
    .card-item__numberItem.active {
      width: 8px;
    }
  }
  .card-item__content {
    color: var(--white, #fff);
    display: flex;
    align-items: flex-start;
  }
  .card-item__date {
    flex-wrap: wrap;
    font-size: 18px;
    margin-left: auto;
    padding: 10px;
    display: inline-flex;
    width: 80px;
    white-space: nowrap;
    flex-shrink: 0;
    cursor: pointer;
  }
  @media screen and (max-width: 480px) {
    .card-item__date {
      font-size: 16px;
    }
  }
  .card-item__dateItem {
    position: relative;
    width: 22px;
  }
  .card-item__dateItem span {
    position: absolute;
    display: inline-block;
  }
  .card-item__dateTitle {
    opacity: 0.7;
    font-size: 13px;
    padding-bottom: 6px;
    width: 100%;
  }
  @media screen and (max-width: 480px) {
    .card-item__dateTitle {
      font-size: 12px;
      padding-bottom: 5px;
    }
  }
  .card-item__band {
    background: rgba(0, 0, 19, 0.8);
    width: 100%;
    height: 50px;
    margin-top: 30px;
    position: relative;
    z-index: 2;
  }
  @media screen and (max-width: 480px) {
    .card-item__band {
      margin-top: 20px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__band {
      height: 40px;
      margin-top: 10px;
    }
  }
  .card-item__cvv {
    text-align: right;
    position: relative;
    z-index: 2;
    padding: 15px;
  }
  .card-item__cvv .card-item__type {
    opacity: 0.7;
  }
  @media screen and (max-width: 360px) {
    .card-item__cvv {
      padding: 10px 15px;
    }
  }
  .card-item__cvvTitle {
    padding-right: 10px;
    font-size: 15px;
    font-weight: 500;
    color: var(--white, #fff);
    margin-bottom: 5px;
  }
  .card-item__cvvBand {
    height: 45px;
    background: var(--white, #fff);
    margin-bottom: 30px;
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
    color: #1a3b5d;
    font-size: 18px;
    border-radius: 4px;
    box-shadow: 0px 10px 20px -7px rgba(32, 56, 117, 0.35);
  }
  @media screen and (max-width: 480px) {
    .card-item__cvvBand {
      height: 40px;
      margin-bottom: 20px;
    }
  }
  @media screen and (max-width: 360px) {
    .card-item__cvvBand {
      margin-bottom: 15px;
    }
  }

  .card-list {
    margin-bottom: -130px;
  }
  @media screen and (max-width: 480px) {
    .card-list {
      margin-bottom: -120px;
    }
  }

  .card-input {
    margin-bottom: 20px;
  }
  .card-input__label {
    font-size: 14px;
    margin-bottom: 5px;
    font-weight: 500;
    color: #1a3b5d;
    width: 100%;
    display: block;
    userselect: none;
  }
  .card-input__input {
    width: 100%;
    height: 50px;
    border-radius: 5px;
    box-shadow: none;
    border: 1px solid var(--gray-100, #ced6e0);
    transition: all 0.3s ease-in-out;
    font-size: 18px;
    padding: 5px 15px;
    background: none;
    color: var(--black, #1a3b5d);
    font-family: "Source Sans Pro", sans-serif;
  }

  .card-input__input:hover, .card-input__input:focus {
    border-color: var(--primary-faded, #3d9cff);

  }
  .card-input__input:focus {
    box-shadow: 0px 10px 20px -13px rgba(32, 56, 117, 0.35);
  }
  .card-input__input.select {
    -webkit-appearance: none;
    background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAeCAYAAABuUU38AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAUxJREFUeNrM1sEJwkAQBdCsngXPHsQO9O5FS7AAMVYgdqAd2IGCDWgFnryLFQiCZ8EGnJUNimiyM/tnk4HNEAg/8y6ZmMRVqz9eUJvRaSbvutCZ347bXVJy/ZnvTmdJ862Me+hAbZCTs6GHpyUi1tTSvPnqTpoWZPUa7W7ncT3vK4h4zVejy8QzM3WhVUO8ykI6jOxoGA4ig3BLHcNFSCGqGAkig2yqgpEiMsjSfY9LxYQg7L6r0X6wS29YJiYQYecemY+wHrXD1+bklGhpAhBDeu/JfIVGxaAQ9sb8CI+CQSJ+QmJg0Ii/EE2MBiIXooHRQhRCkBhNhBcEhLkwf05ZCG8ICCOpk0MULmvDSY2M8UawIRExLIQIEgHDRoghihgRIgiigBEjgiFATBACAgFgghEwSAAGgoBCBBgYAg5hYKAIFYgHBo6w9RRgAFfy160QuV8NAAAAAElFTkSuQmCC");
    background-size: 12px;
    background-position: 90% center;
    background-repeat: no-repeat;
    padding-right: 30px;
  }

  /* Error States*/
  .card-input .valid> .card-input__input {
    border: 1px solid var(--success, #003b29);
    color: var(--success, #003b29);
  }
  .card-input.invalid > .card-input__input {
    border: 1px solid var(--alert, #d80008);
    color: var(--black, #370002);
  }
  .card-input.invalid > .card-input__input.select {
    border: 1px solid var(--alert, #d80008);
    color: var(--black, #370002);
  }
  .card-input.invalid > .card-input__label {
    color: var(--alert, #d80008);
  }
  .invalid-feedback {
    color: var(--alert, #d80008);
    font-size: 0.65rem;
    line-height: 1rem;
    height: 1rem;
    position: absolute;
    width: 100%;
  }
  .card-form_group.invalid > .card-input__label {
    color: var(--alert, #d80008);
  }
  .card-form__group.invalid > .invalid-feedback {
    width: 100%;
    bottom: 0px;
  }

</style>

<div class="wrapper" id="payment-form-card">
  <div class="card-form">
    <div class="card-list">
      <div
        class="card-item"
        class:active={isCardFlipped}
      >
        <div class="card-item__side front">
          <div
            class="card-item__focus"
            class:active={focusElementStyle}
            style={focusElementStyle}
            bind:this={refs.focusElement}
          ></div>
          <div class="card-item__cover">
            <img
              alt="card"
              src={'https://cdn.rise.store/payment-form/images/' + currentCardBackground + '.jpeg'}
              class="card-item__bg"
            >
          </div>
          <div class="card-item__wrapper">
            <div class="card-item__top">
              <img
                alt="card"
                src="https://cdn.rise.store/payment-form/images/chip.png"
                class="card-item__chip"
              >
              <div class="card-item__type">
                {#if card_type}
                  {#each [card_type] as card_type (card_type)}
                    <img
                      in:fly={{y:-20}}
                      out:fly={{y:20}}
                      src={'https://cdn.rise.store/payment-form/images/' + card_type + '.png'}
                      alt={card_type}
                      class="card-item__typeImg"
                    >
                  {/each}
                {/if}
              </div>
            </div>
            <label for="card_number" class="card-item__number" bind:this={refs.card_number}>
              {#each cardNumberMask as n, index (index)}
                <div class="card-item__numberItem" class:active={n.trim() === ''}>
                  {#if card.card_number && card.card_number.length > index}
                    <span
                      in:fly={{y:-10}}
                      out:fly={{y:10}}
                    >{card.card_number[index]}</span>
                  {:else}
                    <span
                      in:fly={{y:-10}}
                      out:fly={{y:10}}
                    >{n}</span>
                  {/if}
                </div>
              {/each}
            </label>
            <div class="card-item__content">
              <label for="card_name" class="card-item__info" bind:this={refs.card_name}>
                <div class="card-item__holder">{card_name_label}</div>
                {#if card.card_name.length}
                  <div class="card-item__name">
                    {#each card.card_name.replace(/\s\s+/g, ' ') as n, index (index + 1)}
                      {#if index == index}
                        <span
                          in:fly={{y:-6}}
                          class="card-item__nameItem"
                        >{n}</span>
                      {/if}
                    {/each}
                  </div>
                {:else}
                  <div
                    in:fly={{y:-6}}
                    class="card-item__name placeholder"
                  >Full Name</div>
                {/if}
              </label>
              <div class="card-item__date" bind:this={refs.cardDate}>
                <label for="card_month" class="card-item__dateTitle">Expires</label>
                <label for="card_month" class="card-item__dateItem">
                  {#each [card.card_month] as card_month (card_month)}
                    <span
                      in:fly={{y:-6}}
                      out:fly={{y:6}}
                    >{card_month || 'MM'}</span>
                  {/each}
                </label>
                /
                <label for="card_year" class="card-item__dateItem">
                  {#each [card.card_year] as card_year (card_year)}
                    <span in:fly={{y:-6}} out:fly={{y:6}}>{card_year ? String(card_year).slice(2,4) : 'YY'}</span>
                  {/each}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="card-item__side back">
          <div class="card-item__cover">
            <img alt="card" src={'https://cdn.rise.store/payment-form/images/' + currentCardBackground + '.jpeg'} class="card-item__bg">
          </div>
          <div class="card-item__band"></div>
          <div class="card-item__cvv">
            <div class="card-item__cvvTitle">{card_cvv_label}</div>
            <div class="card-item__cvvBand">{card.card_cvv}</div>
            <div class="card-item__type">
              {#if card_type}
                {#each [card_type] as card_type (card_type)}
                  <img in:fly={{y:-20}} out:fly={{y:20}} alt="card" src={'https://cdn.rise.store/payment-form/images/' + card_type + '.png'} class="card-item__typeImg">
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
    <form class="card-form__inner" on:submit|preventDefault={submit}>
      <div class="card-form-error-container">
      {#if !!errors}
        <ul
          class="card-form-error-container__errors"
          in:fly={{y:-20}}
          out:fly={{y:20}}
        >
          {#each errors as err, i}
            <li
              class="card-form-error-container__errors__error"
            >
              {err.message ? err.message : err}
  <!--            <pre>{ JSON.stringify(err)}</pre>-->
            </li>
          {/each}
        </ul>
      {/if}
      </div>
      <div
        class="card-input"
        class:invalid={!$cardForm.card_number.valid}
        use:bindClass="{{ form: cardForm, name: 'card_number', invalid: 'invalid' }}"
      >
        <label for="card_number" class="card-input__label">{card_number_label}</label>
        <input
          type="text"
          id="card_number"
          class="card-input__input"
          v-mask="generateCardNumberMask"
          bind:value={card.card_number}
          on:focus={focusInput}
          on:blur={blurInput}
          data-ref="card_number"
          autocomplete="off"
          disabled={!canEditNumber}
        >
        {#if $cardForm.card_number.errors.includes('required')}
          <div
            class="invalid-feedback"
            in:fly={{x:-20}}
            out:fly={{x:20}}
          >Card Number is required</div>
        {:else if $cardForm.card_number.errors.includes('number') }
          <div
            class="invalid-feedback"
            in:fly={{x:-20}}
            out:fly={{x:20}}
          >Card Number is not a valid number</div>
        {/if}
      </div>
      <div
        class="card-input"
        class:invalid={!$cardForm.card_name.valid}
        use:bindClass="{{ form: cardForm, name: 'card_name', invalid: 'invalid' }}"
      >
        <label for="card_name" class="card-input__label">{card_name_label}</label>
        <input
          type="text"
          id="card_name"
          class="card-input__input"
          bind:value={card.card_name}
          on:focus={focusInput}
          on:blur={blurInput}
          data-ref="card_name"
          autocomplete="off"
          disabled={!canEditName}
        >
        {#if $cardForm.card_name.errors.includes('required')}
          <div
            class="invalid-feedback"
            in:fly={{x:-20}}
            out:fly={{x:20}}
          >Card Holder is required</div>
        {:else if $cardForm.card_name.errors.includes('name') }
          <div
            class="invalid-feedback"
            in:fly={{x:-20}}
            out:fly={{x:20}}
          >Card Holder is not a valid Name</div>
        {/if}
      </div>
      <div class="card-form__row">
        <div class="card-form__col">
          <div
            class="card-form__group"
            class:invalid={!$cardForm.card_month.valid || !$cardForm.card_year.valid}
            use:bindClass="{{ form: cardForm, name: 'card_month', invalid: 'invalid' }}"
          >
            <label for="card_month" class="card-input__label">{ card_expiration_label }</label>
            <select
              class="card-input__input select"
              id="card_month"
              bind:value={card.card_month}
              on:focus={focusInput}
              on:blur={blurInput}
              data-ref="cardDate"
              disabled={!canEditMonth}
            >
              <option value="" disabled selected>Month</option>
              {#each Array(12) as _, n}
                <option value={(n+1) < 10 ? '0' + (n+1) : (n+1)} disabled={(n+1) < minCardMonth}>
                  {(n+1) < 10 ? '0' + (n+1) : (n+1)}
                </option>
              {/each}
            </select>
            <select
              class="card-input__input select"
              id="card_year"
              bind:value={card.card_year}
              use:bindClass="{{ form: cardForm, name: 'card_year', invalid: 'invalid' }}"
              on:focus={focusInput}
              on:blur={blurInput}
              data-ref="cardDate"
              disabled={!canEditYear}
            >
              <option value="" disabled selected>Year</option>
              {#each Array(12) as _, n}
                <option value={n + minCardYear}>
                  {n + minCardYear}
                </option>
              {/each}
            </select>
            {#if $cardForm.card_month.errors.includes('required')}
              <div
                class="invalid-feedback"
                in:fly={{x:-20}}
                out:fly={{x:20}}
              >Card Month is required</div>
            {:else if $cardForm.card_month.errors.includes('month') }
              <div
                class="invalid-feedback"
                in:fly={{x:-20}}
                out:fly={{x:20}}
              >Card Month is not a valid month</div>
            {:else if $cardForm.card_year.errors.includes('required')}
              <div
                class="invalid-feedback"
                in:fly={{x:-20}}
                out:fly={{x:20}}
              >Card Year is required</div>
            {:else if $cardForm.card_year.errors.includes('year') }
              <div
                class="invalid-feedback"
                in:fly={{x:-20}}
                out:fly={{x:20}}
              >Card Year is not a valid year</div>
            {/if}
          </div>
        </div>
        <div class="card-form__col cvv">
          <div
            class="card-input"
            class:invalid={!$cardForm.card_cvv.valid}
            use:bindClass="{{ form: cardForm, name: 'card_cvv', invalid: 'invalid' }}"
          >
            <label for="card_cvv" class="card-input__label">{card_cvv_label}</label>
            <input
              type="text"
              class="card-input__input"
              id="card_cvv"
              v-mask="'####'"
              maxlength="4"
              bind:value={card.card_cvv}
              on:focus={() => isCardFlipped = true}
              on:blur={() => isCardFlipped = false}
              autocomplete="off"
              disabled={!canEditCvv}
            >
            {#if $cardForm.card_cvv.errors.includes('required')}
              <div
                class="invalid-feedback"
                in:fly={{x:-20}}
                out:fly={{x:20}}
              >Card Cvv is required</div>
            {:else if $cardForm.card_cvv.errors.includes('cvv') }
              <div class="invalid-feedback">Card Cvv is not a valid cvv</div>
            {/if}
          </div>
        </div>
      </div>

      <div
        class="card-form__button"
        class:active={is_processing}
        data-progress-style="fill-back"
      >
        <div class="progress"></div>
        <button
          class="btn"
          type="submit"
          class:disabled
          class:is_processing
          {disabled}
        >
          {#if is_processing}
            <div
              class="btn__text"
              in:fly={{x:-200}}
              out:fly={{x:200}}
            >Processing...</div>
          {:else}
            <div
              class="btn__text"
              in:fly={{x:-200}}
              out:fly={{x:200}}
            >{submit_text}</div>
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
