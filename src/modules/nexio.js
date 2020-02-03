// https://docs.nexiopay.com/#browser-based-encryption

import JSEncrypt from 'jsencrypt'
import get from 'lodash.get'

export const nexio = {
  // Convert NEXIO status codes to RiSE codes
  ERROR_MESSAGES: {
    'fraud': ['431'],
    'invalid_cvc': ['437'],
    'invalid_request': ['438', '441'],
    'invalid_currency': ['432'],
    'avs_failed': ['443'],
    'unable_to_process': ['435', '436', '439', '440', '404', '409'],
    'unknown': ['500', '501', '503'],
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

  // If requests should use the sandbox or not
  LIVE_MODE: false,

  // The URL to save a card
  saveCardUrl: nexio.LIVE_MODE ? '' : 'https://api.nexiopaysandbox.com/pay/v3/saveCard',

  // The URL to get a the token from
  getTokenUrl: nexio.LIVE_MODE ? '' : 'https://api.nexiopaysandbox.com/pay/v3/token',

  // The browser encryption library
  crypt: new JSEncrypt(),

  // TODO
  // Get a NEXIO single use token
  getToken: async (rise, _customer) => {
    return fetch(nexio.getTokenUrl, {
      method: 'POST',
      mode: 'no-cors', // no-cors, *cors, same-origin
      headers: [

      ],
      body: JSON.stringify({
        customer: _customer
      })
    })
  },

  // Set the Public key in which to encrpyt the card number
  setKey: (key) => {
    nexio.publicKey = key
    return nexio.publicKey
  },

  // The public key
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

    try {
      newCustomer.encryptedNumber = nexio.encrypt(newCustomer.encryptedNumber)
    }
    catch(err) {
      return Promise.reject({errors: [{'unable_to_process': err}]})
    }

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

  // Encrpt a string using the public key
  encrypt: (str) => {
    nexio.crypt.setKey(nexio.publicKey)
    return nexio.crypt.encrypt(str)
  },

  // Submit the Card to Nexio and return the result or errors
  submit: async (rise, card) => {
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
        return nexio.getToken(rise, _customer)
          .then(token => {
            return [_card, _customer, token]
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([_card, _customer, { token }]) => {

        console.log("BRK TOKEN", token, _customer)

        return fetch(nexio.saveCardUrl, {
          method: 'POST',
          mode: 'no-cors', // no-cors, *cors, same-origin
          body: JSON.stringify({
            token: token,
            card: _card
          })
        })
      })
      .then((response) => {
        return response.json()
      })
      .then(res => {
        console.log('BRK RES', res)
        if (res.error) {
          return Promise.reject(res)
        }
        return res
      })
      .catch(err => {
        const errors = nexio.transformError(err)
        return Promise.reject(errors)
      })
  }
}
