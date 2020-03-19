import get from 'lodash.get'

export const stripe = {
  TEST_NUMBERS: {
    SUCCESS: 4242424242424242, //	Succeeds and immediately processes the payment.
    // REQUIRES_AUTH: 4000002500003155, //	Requires authentication for the initial purchase, but succeeds for subsequent payments (including off-session ones) as long as the card is setup with setup_future_usage.
    REQUIRES_AUTH: 4000002760003184, //	Requires authentication for the initial purchase, and fails for subsequent payments (including off-session ones) with an authentication_required decline code.
    INSUFFICIENT: 4000008260003178, //	Requires authentication for the initial purchase, but fails for subsequent payments (including off-session ones) with an insufficient_funds decline code.
    FAILURE: 4000000000009995, //	Always fails (including the initial purchase) with a decline code of insufficient_funds.

  },
  ERROR_MESSAGES: {
    'fraud': ['431'],
    'invalid_cvc': ['437'],
    'invalid_request': ['402'],
    'invalid_currency': ['432'],
    'avs_failed': ['443'],
    'unable_to_process': ['400', '401', '404', '403', '409', '429'],
    'unknown': ['500', '501', '502', '503', '504', 'E_NOT_FOUND'],
  },

  // Convert RiSE fields to NEXIO Card Fields
  CARD_FIELDS: {
    'card_number': 'number',
    'card_name': 'name',
    'card_month': 'exp_month',
    'card_year': 'exp_year',
    'card_cvv': 'cvc',
    'card_currency': 'currency',

    // 'name_first': 'name',
    // 'name_last': 'name',
    // 'email': 'email',
    // 'phone': 'phone',

    'address_1': 'address_line1',
    'address_2': 'address_line2',
    'city': 'address_city',
    'province_code': 'address_state',
    'country_code': 'address_country',
    'postal_code': 'address_zip'
  },

  // If requests should use the sandbox or not
  LIVE_MODE: false,

  // Hold the key the library will use for instantiation
  publicKey: false,

  // Set the Public key in which Stripe will use
  setKey: (key) => {
    stripe.publicKey = key
    return stripe.publicKey
  },

  lib: function() {
    return Stripe(stripe.publicKey)
  },

  // Transform RiSE fields into a stripe CARD
  transformCard: (card) => {
    const newCard = {}
    const keys = Object.keys(stripe.CARD_FIELDS)

    keys.forEach((k) => {
      // This handles nested card_fields in dot syntax
      newCard[stripe.CARD_FIELDS[k]] = get(card, k)
    })

    return Promise.resolve(newCard)
  },

  // TODO, make sure this is right
  // Transform stripe error codes into RiSE error codes
  transformError: ({error, message}) => {
    console.log('BRK errors', error, message)

    const newErrors = []
    const errorKeys = Object.keys(stripe.ERROR_MESSAGES)

    errorKeys.forEach((key) => {
      if (stripe.ERROR_MESSAGES[key].includes(`${error}`)) {
        newErrors.push({[key]: message })
      }
    })

    if (newErrors.length === 0) {
      newErrors.push({'unknown': null})
    }

    return { errors: newErrors }
  },

  submit: async (rise, config, cart, customer, card) => {
    return Promise.resolve()
      .then(() => {
        return stripe.transformCard(card)
          .then(_card => {
            return [_card]
          })
      })
      .then(([_card]) => {
        return new Promise((resolve, reject) => {
          stripe.token.create({
            card: _card
          }, function (err, token) {
            if (err) {
              return reject(err)
            }
            else {
              return resolve(token)
            }
          })
        })
      })
      .then(token => {
        return token
      })
      .catch(err => {
        const errors = stripe.transformError(err)
        return Promise.reject(errors)
      })
  }
}
