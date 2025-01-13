const SUCCESS_CODE_API = 'success'
const DEFAULT_CURRENCY = 'USD'

const getUserIp = () => {
  return fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then(({ ip }) => ip)
}

const fetchUserCurrencyCode = async (ip) => {
  const userInfoQueryLink = `http://ip-api.com/json/${ip}?fields=status,currency`

  return fetch(userInfoQueryLink)
    .then((response) => response.json())
    .then((result) => result)
}

const fetchRatesData = async (currencyCode) => {
  const ratesQueryLink = `https://open.er-api.com/v6/latest/${currencyCode}`

  return fetch(ratesQueryLink)
    .then((response) => response.json())
    .then((result) => result)
}

const fetchInitialData = async () => {
  let userCurrency = DEFAULT_CURRENCY

  const userIp = await getUserIp()
  const { status, currency } = await fetchUserCurrencyCode(userIp)

  if (status === SUCCESS_CODE_API) {
    userCurrency = currency
  }

  const { result, rates } = await fetchRatesData(userCurrency)

  if (result !== SUCCESS_CODE_API) {
    alert('Something went wrong, please check your internet connection and reload the page.')
    return
  }

  return { userCurrency, rates }
}

const app = async () => {
  const { userCurrency, rates } = await fetchInitialData()

  console.log(userCurrency, rates)
  //TODO - APP STRUCTURE
  // 2. Add handlers
}

app()
