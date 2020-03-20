// https://docs.nexiopay.com/#browser-based-encryption

import JSEncrypt from 'jsencrypt'
import get from 'lodash.get'

export const nexio = {
  TEST_NUMBERS: {
    // SUCCESS: 4242424242424242, //	Succeeds and immediately processes the payment.
    // // REQUIRES_AUTH: 4000002500003155, //	Requires authentication for the initial purchase, but succeeds for subsequent payments (including off-session ones) as long as the card is setup with setup_future_usage.
    // REQUIRES_AUTH: 4000002760003184, //	Requires authentication for the initial purchase, and fails for subsequent payments (including off-session ones) with an authentication_required decline code.
    // INSUFFICIENT: 4000008260003178, //	Requires authentication for the initial purchase, but fails for subsequent payments (including off-session ones) with an insufficient_funds decline code.
    // FAILURE: 4000000000009995, //	Always fails (including the initial purchase) with a decline code of insufficient_funds.

  },
  // Convert NEXIO status codes to RiSE codes
  ERROR_MESSAGES: {
    'fraud': ['431'],
    'invalid_cvc': ['437'],
    'invalid_request': ['438', '441'],
    'invalid_currency': ['432'],
    'avs_failed': ['443'],
    'unable_to_process': ['442', '434', '435', '436', '439', '440', '404', '409'],
    'unknown': ['500', '501', '503', 'E_NOT_FOUND'],
  },

  ERROR_MESSAGE_OVERRIDES: {
    'fraud': 'We are unable to process your request at this moment, please contact customer support.'
  },

  // Convert RiSE fields to NEXIO Card Fields
  CARD_FIELDS: {
    'card_number': 'encryptedNumber',
    'card_name': 'cardHolderName',
    'card_month': 'expirationMonth',
    'card_year': 'expirationYear',
    'card_cvv': 'securityCode',
    'card_type': 'cardType'
  },

  // Convert RiSE fields to NEXIO Customer Fields
  CUSTOMER_FIELDS: {
    'name_first': 'firstName',
    'name_last': 'lastName',
    'email': 'email',
    'phone': 'phone',
    'address_1': 'billToAddressOne',
    'address_2': 'billToAddressTwo',
    'city': 'billToCity',
    'province_code': 'billToState',
    'country_code': 'billToCountry',
  },

  CART_FIELDS: {},

  CART_ITEM_FIELDS: {},

  // The URL to save a card
  saveCardUrl: (rise) => rise.live_mode
    ? 'https://api.nexiopay.com/pay/v3/saveCard'
    : 'https://api.nexiopaysandbox.com/pay/v3/saveCard',

  // The URL to get a the token from
  getTokenUrl: (rise) => rise.live_mode
    ? `https://api.rise.store/api/v1/channels/${rise.channel_uuid}/endpoints/handle/nexio-one-time-use-token`
    // : `http://localhost:3002/api/v1/channels/${rise.channel_uuid}/endpoints/handle/nexio-one-time-use-token`,
    : `https://api.sandbox.rise.store/api/v1/channels/${rise.channel_uuid}/endpoints/handle/nexio-one-time-use-token`,

  // The browser encryption library
  crypt: new JSEncrypt(),

  // Get a NEXIO single use token from RiSE
  getSingleUseToken: async (rise, config = { processingOptions: {}}, _card, _customer, _cart) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    const processingOptions = {
      checkFraud: get(config, 'processingOptions.checkFraud', false),
      verifyCvc: get(config, 'processingOptions.verifyCvc', false),
      verifyAvs: get(config, 'processingOptions.verifyAvs', false),
      check3ds: get(config, 'processingOptions.check3ds', false),
      saveCardToken: get(config, 'processingOptions.saveCardToken', false),
      verboseResponse: get(config, 'processingOptions.verboseResponse', false),
      webhookUrl: get(config, 'processingOptions.webhookUrl', ""),
      webhookFailUrl: get(config, 'processingOptions.webhookFailUrl', ""),

      // paymentOptionTag: "switch",
    }

    const tokenUrl = nexio.getTokenUrl(rise)

    if (rise.key_public) {
      headers['X-APPLICATION-KEY'] = rise.key_public
    }
    if (rise.session) {
      headers['Session'] = rise.session
    }
    if (rise.token) {
      headers['Authorization'] = `JWT ${rise.token}`
    }

    return fetch(tokenUrl, {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache',
      headers: headers,
      body: JSON.stringify({
        customer: _customer,
        card: _card,
        processingOptions: processingOptions
      })
    })
      .then((response) => {
        return response.json()
      })
      .then(res => {
        if (res.error) {
          return Promise.reject(res)
        }
        return res.data
      })
      .catch(err => {
        return Promise.reject({errors: [{'unable_to_process': err}]})
      })
  },

  // Send encrpted card to Nexio to return a Card token to use in later transactions
  getCardToken: async (rise, config, card, customer, cart, token) => {
    const processingOptions = {
      checkFraud: get(config, 'processingOptions.checkFraud', false),
      verifyCvc: get(config, 'processingOptions.verifyCvc', false),
      verifyAvs: get(config, 'processingOptions.verifyAvs', false),
      check3ds: get(config, 'processingOptions.check3ds', false),
      saveCardToken: get(config, 'processingOptions.saveCardToken', false),
      verboseResponse: get(config, 'processingOptions.verboseResponse', false),
      webhookUrl: get(config, 'processingOptions.webhookUrl', ""),
      webhookFailUrl: get(config, 'processingOptions.webhookFailUrl', ""),

      // paymentOptionTag: "switch",
    }

    return fetch(nexio.saveCardUrl(rise), {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      body: JSON.stringify({
        token: token,
        customer: customer,
        card: card,
        processingOptions: processingOptions,
        // data: {
        //   card: {
        //     securityCode: _card.securityCode
        //   }
        // }
      })
    })
  },

  // Set the Public key in which to encrpyt the card number
  setKey: (key) => {
    nexio.publicKey = key
    return nexio.publicKey
  },

  // The NEXIO public key, defaults to Sandbox key
  publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFjQQCPpaIlJKpeg irp5kLkzLB1AxHmnLk73D3TJbAGqr1QmlsWDBtMPMRpdzzUM7ZwX3kzhIuATV4Pe 7RKp3nZlVmcrT0YCQXBrTwqZNh775z58GP2kZs+gVfNqBampJPzSB/hB62KkByhE Cn6grrRjiAVwJyZVEvs/2vrxaEpO+aE16emtX12RgI5JdzdOiNyZEQteU6zRBRJE ocPWVxExaOpVVVJ5+UnW0LcalzA+lRGRTrQJ5JguAPiAOzRPTK/lYFFpCAl/F8wt oAVG1c8zO2NcQ0Pko+fmeidRFxJ/did2btV+9Mkze3mBphwFmvnxa35LF+Cs/XJHDwIDAQAB',

  // Transform RiSE fields into a nexio CARD
  transformCard: (card) => {
    const newCard = {}
    const keys = Object.keys(nexio.CARD_FIELDS)

    keys.forEach((k) => {
      // This handles nested card_fields in dot syntax
      newCard[nexio.CARD_FIELDS[k]] = get(card, k)
    })

    // Should encrypt card_number to encryptedNumber so that we don't pass the number anywhere from the client
    try {
      newCard.encryptedNumber = nexio.encrypt(newCard.encryptedNumber)
    }
    // Reject this as unable to process error if unable to encrypt
    catch(err) {
      return Promise.reject({errors: [{'unable_to_process': err}]})
    }

    return Promise.resolve(newCard)
  },

  // Transform RiSE fields into a Nexio Customer
  transformCustomer: (customer) => {
    const newCustomer = {}
    const keys = Object.keys(nexio.CUSTOMER_FIELDS)

    keys.forEach((k) => {
      // This handles nested customer_fields in dot syntax
      const value = get(customer, k)

      if (value && value !== '') {
        newCustomer[nexio.CUSTOMER_FIELDS[k]] = value
      }
    })

    return Promise.resolve(newCustomer)
  },

  // TODO, make sure this is right
  // Transform Nexio error codes into RiSE error codes
  transformError: ({error, message}) => {

    const newErrors = []
    const errorKeys = Object.keys(nexio.ERROR_MESSAGES)

    errorKeys.forEach((key) => {
      if (nexio.ERROR_MESSAGES[key].includes(`${error}`)) {
        if (Object.keys(nexio.ERROR_MESSAGE_OVERRIDES).includes(key)) {
          message = nexio.ERROR_MESSAGE_OVERRIDES[key]
        }
        newErrors.push({[key]: message })
      }
    })

    if (newErrors.length === 0) {
      newErrors.push({'unknown': null})
    }

    return { errors: newErrors }
  },

  // Encrypt a string using the public key
  encrypt: (str) => {
    nexio.crypt.setKey(nexio.publicKey)
    return nexio.crypt.encrypt(str)
  },

  // Submit the Card to Nexio and return the result or errors
  submit: async (rise, config, cart, customer, card) => {
    // Set the public key from the config
    nexio.setKey(config.publicKey)

    // Return Response
    return Promise.resolve()
      .then(() => {
        return nexio.transformCard(card)
          .then((_card) => {
            return nexio.transformCustomer(card)
              .then(_customer => {
                return [_card, _customer, cart]
              })
              .catch(err => {
                return Promise.reject({errors: [{'unable_to_process': err}]})
              })
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([_card, _customer, _cart]) => {
        // Get a single use token
        return nexio.getSingleUseToken(rise, config, _card, _customer, _cart)
          .then(res => {
            return [_card, _customer, _cart, res]
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([_card, _customer, _cart, { token }]) => {
        return nexio.getCardToken(rise, config, _card, _customer, _cart, token)
      })
      .then((response) => {
        return response.json()
      })
      .then(res => {
        if (res.error) {
          return Promise.reject(res)
        }

        return {
          token: res.token.token,
          success: res
        }
      })
      .catch(err => {
        console.log('BRK ERR NEXIO', err)
        const errors = nexio.transformError(err)
        return Promise.reject(errors)
      })
  }
}
