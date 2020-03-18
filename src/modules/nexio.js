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
    'unable_to_process': ['442', '435', '436', '439', '440', '404', '409'],
    'unknown': ['500', '501', '503', 'E_NOT_FOUND'],
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

  // Get a NEXIO single use token
  getToken: async (rise, _card, _customer) => {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (rise.key_public) {
      headers['X-APPLICATION-KEY'] = rise.key_public
    }
    if (rise.session) {
      headers['Session'] = rise.session
    }
    if (rise.token) {
      headers['Authorization'] = `JWT ${rise.token}`
    }

    return fetch(nexio.getTokenUrl(rise), {
      method: 'POST',
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache',
      headers: headers,
      body: JSON.stringify({
        customer: _customer,
        card: _card
        // "processingOptions": {
        //   "checkFraud": true
        // }
      })
    })
      .then((response) => {
        return response.json()
      })
      .then(res => {
        console.log('BRK RES', res.data)
        if (res.error) {
          return Promise.reject(res)
        }
        return res.data
      })
      .catch(err => {
        return Promise.reject({errors: [{'unable_to_process': err}]})
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

    try {
      newCard.encryptedNumber = nexio.encrypt(newCard.encryptedNumber)
    }
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
      newCustomer[nexio.CUSTOMER_FIELDS[k]] = get(customer, k)
    })

    return Promise.resolve(newCustomer)
  },

  // TODO, make sure this is right
  // Transform Nexio error codes into RiSE error codes
  transformError: ({error, message}) => {
    console.log('BRK errors', error, message)

    const newErrors = []
    const errorKeys = Object.keys(nexio.ERROR_MESSAGES)

    errorKeys.forEach((key) => {
      if (nexio.ERROR_MESSAGES[key].includes(`${error}`)) {
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
  submit: async (rise, config, card) => {
    // Set the public key from the config
    nexio.setKey(config.publicKey)

    // Return Response
    return Promise.resolve()
      .then(() => {
        return nexio.transformCard(card)
          .then((_card) => {
            return nexio.transformCustomer(card)
              .then(_customer => {
                return [_card, _customer]
              })
              .catch(err => {
                return Promise.reject({errors: [{'unable_to_process': err}]})
              })
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([_card, _customer]) => {
        // Get a single use token
        return nexio.getToken(rise, _card, _customer)
          .then(token => {
            return [_card, _customer, token]
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([_card, _customer, { token }]) => {

        console.log('BRK TOKEN', token, _customer, _card)

        return fetch(nexio.saveCardUrl(rise), {
          method: 'POST',
          mode: 'cors', // no-cors, *cors, same-origin
          body: JSON.stringify({
            token: token,
            card: _card,
            processingOptions: { verifyAvs: '3' }
          })
        })
      })
      .then((response) => {
        return response.json()
      })
      .then(res => {
        console.log('BRK RES NEXIO', res)
        if (res.error) {
          return Promise.reject(res)
        }
        return res
      })
      .catch(err => {
        console.log('BRK ERR NEXIO', err)
        const errors = nexio.transformError(err)
        return Promise.reject(errors)
      })
  }
}
