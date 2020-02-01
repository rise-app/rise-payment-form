// https://docs.nexiopay.com/#browser-based-encryption

import JSEncrypt from 'jsencrypt'
import get from 'lodash.get'

export const nexio = {
  ERROR_MESSAGES: {
    'fraud': ['431'],
    'invalid_cvc': ['437'],
    'invalid_request': ['438', '441'],
    'invalid_currency': ['432'],
    'avs_failed': ['443'],
    'unable_to_process': ['435', '436', '439', '440', '404', '409'],
    'unknown': ['500', '501', '503'],
  },

  FIELDS: {
    'card_number': 'encryptedNumber',
    'card_name': 'cardHolderName',
    'card_month': 'expirationMonth',
    'card_year': 'expirationYear',
    'card_cvv': 'securityCode',
    'card_type': 'cardType'
  },

  crypt: new JSEncrypt(),

  // TODO
  getToken: async (publicKey) => {
    return Promise.resolve('') // publicKey
  },

  setKey: (key) => {
    nexio.publicKey = key
    return nexio.publicKey
  },

  publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvWpIQFjQQCPpaIlJKpeg irp5kLkzLB1AxHmnLk73D3TJbAGqr1QmlsWDBtMPMRpdzzUM7ZwX3kzhIuATV4Pe 7RKp3nZlVmcrT0YCQXBrTwqZNh775z58GP2kZs+gVfNqBampJPzSB/hB62KkByhE Cn6grrRjiAVwJyZVEvs/2vrxaEpO+aE16emtX12RgI5JdzdOiNyZEQteU6zRBRJE ocPWVxExaOpVVVJ5+UnW0LcalzA+lRGRTrQJ5JguAPiAOzRPTK/lYFFpCAl/F8wt oAVG1c8zO2NcQ0Pko+fmeidRFxJ/did2btV+9Mkze3mBphwFmvnxa35LF+Cs/XJHDwIDAQAB',

  transformCard: (card) => {
    const newCard = {}
    const keys = Object.keys(nexio.FIELDS)

    keys.forEach((k) => {
      console.log('brk ', k, nexio.FIELDS[k], get(card, k))
      // This handles nested fields in dot syntax
      newCard[nexio.FIELDS[k]] = get(card, k)
    })

    try {
      newCard.encryptedNumber = nexio.encrypt(newCard.encryptedNumber)
    }
    catch(err) {
      return Promise.reject({errors: [{'unable_to_process': err}]})
    }

    console.log('BRK SUBMITTED!', card, newCard)


    return Promise.resolve(newCard)
  },

  // TODO, make sure this is right
  transformError: ({error, message}) => {
    console.log('BRK errors', error, message)

    const newErrors = []
    const errorKeys = Object.keys(nexio.ERROR_MESSAGES)

    errorKeys.forEach((key) => {
      if (nexio.ERROR_MESSAGES[key].includes(`${error}`)) {
        newErrors.push({[key]: message })
      }
    })

    return { errors: newErrors }
  },

  encrypt: (str) => {
    nexio.crypt.setKey(nexio.publicKey)
    return nexio.crypt.encrypt(str)
  },

  submit: async (card) => {
    return nexio.transformCard(card)
      .then((card) => {
        // Get a single use token
        return nexio.getToken(nexio.publicKey)
          .then(token => {
            return [card, token]
          })
          .catch(err => {
            return Promise.reject({errors: [{'unable_to_process': err}]})
          })
      })
      .then(([card, token]) => {

        return fetch('https://api.nexiopaysandbox.com/pay/v3/saveCard', {
          method: 'POST',
          body: JSON.stringify({
            token: token,
            card: card
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
