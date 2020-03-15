export const rave = {
  // Convert RAVE status codes to RiSE codes
  ERROR_MESSAGES: {
    // 'fraud': ['431'],
    // 'invalid_cvc': ['437'],
    // 'invalid_request': ['438', '441'],
    // 'invalid_currency': ['432'],
    // 'avs_failed': ['443'],
    // 'unable_to_process': ['435', '436', '439', '440', '404', '409'],
    // 'unknown': ['500', '501', '503', 'E_NOT_FOUND'],
  },

  // Convert RiSE fields to RAVE Card fields
  CARD_FIELDS: {
    'card_number': 'cardno',
    'card_name': 'cardName', // TODO confirm
    'card_month': 'expirymonth',
    'card_year': 'expiryyear',
    'card_cvv': 'cvv',
  },

  // Convert RiSE fields to RAVE Customer Fields
  CUSTOMER_FIELDS: {
    // 'name_first': 'firstName',
    // 'name_last': 'lastName',
    // 'email': 'email',
    // 'phone': 'phone',
    // 'address_1': 'billToAddressOne',
    // 'address_2': 'billToAddressTwo',
    // 'city': 'billToCity',
    // 'province_code': 'billToState',
    // 'country_code': 'billToCountry',
  },

  // The URL to save a card
  // saveCardUrl: (rise) => rave.LIVE_MODE || rise.live_mode
  //   ? 'https://api.ravepaysandbox.com/pay/v3/saveCard'
  //   : 'https://api.ravepay.com/pay/v3/saveCard',

  // The URL to get a the token from
  getTokenUrl: (rise) => rave.LIVE_MODE || rise.live_mode
    ? `https://api.rise.store/api/v1/channels/${rise.channel_uuid}/endpoints/handle/rave-one-time-use-token`
    : `https://api.sandbox.rise.store/api/v1/channels/${rise.channel_uuid}/endpoints/handle/rave-one-time-use-token`,


  // Submit the Card to Rave and return the result or errors
  submit: async (rise, card) => {

  }
}
