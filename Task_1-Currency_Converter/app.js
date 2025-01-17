const SUCCESS_CODE_API = 'success'
const DEFAULT_CURRENCY = 'USD'
const DEFAULT_AMOUNT = 100

const fetchUserIp = async () => {
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

  const userIp = await fetchUserIp()
  const { status, currency } = await fetchUserCurrencyCode(userIp)

  if (status === SUCCESS_CODE_API) {
    userCurrency = currency
  }

  const { result, rates } = await fetchRatesData(userCurrency)

  if (result !== SUCCESS_CODE_API) {
    alert('Something went wrong, please check your internet connection and reload the page.')
    throw new Error('Unable to fetch rates data')
  }

  return { userCurrency, rates }
}

const createInitialCurrenciesLists = (currencyNamesList, sourceCurrency, targetCurrency) => {
  const sourceCurrencySelectElement = document.getElementById('sourceCurrency')
  const targetCurrencySelectElement = document.getElementById('targetCurrency')

  currencyNamesList.forEach((currencyName) => {
    const sourceOption = document.createElement('option')
    sourceOption.value = currencyName.toLowerCase()
    sourceOption.textContent = currencyName

    if (currencyName.toLowerCase() === sourceCurrency.toLowerCase()) {
      sourceOption.setAttribute('selected', 'true')
    }
  
    const targetOption = document.createElement('option')
    targetOption.value = currencyName.toLowerCase()
    targetOption.textContent = currencyName

    if (currencyName.toLowerCase() === targetCurrency.toLowerCase()) {
      targetOption.setAttribute('selected', 'true')
    }
  
    sourceCurrencySelectElement.appendChild(sourceOption)
    targetCurrencySelectElement.appendChild(targetOption)
  });
}

const renderResult = (value, currency) => {
  const resultValueTextElement = document.getElementById('resultValue')
  const resultString = `${value} ${currency}`

  resultValueTextElement.textContent = resultString
}

const calculateExchageValue = (sum, targetCurrencyCode, rates) => (sum * rates[targetCurrencyCode]).toFixed(3)

const initializeApp = async () => {
  const converter = {
    rates: null,
    amount: DEFAULT_AMOUNT,
    sourceCurrency: DEFAULT_CURRENCY,
    targetCurrency: DEFAULT_CURRENCY,
  }

  const { userCurrency, rates } = await fetchInitialData()
  
  converter.sourceCurrency = userCurrency
  converter.rates = rates

  return converter
}

const renderInitialApp = (converter) => {
  const { rates, amount, sourceCurrency, targetCurrency } = converter;
  const currencyNamesList = Object.keys(rates).map((name) => name[0].toUpperCase() + name.slice(1).toLowerCase())

  createInitialCurrenciesLists(currencyNamesList, sourceCurrency, targetCurrency)
  renderResult(calculateExchageValue(amount, targetCurrency, rates), targetCurrency)
}

const app = async () => {
  const converter = await initializeApp()
  renderInitialApp(converter)

  const sourceCurrencySelectElement = document.getElementById('sourceCurrency')
  const targetCurrencySelectElement = document.getElementById('targetCurrency')
  const amountInputElement = document.getElementById('amountInput')

  amountInputElement.addEventListener('input', (e) => {
    const currentValue = e.target.value
    const calculatedExchangeResult = calculateExchageValue(currentValue, converter.targetCurrency, converter.rates)

    converter.amount = Number(currentValue)
    renderResult(calculatedExchangeResult, converter.targetCurrency)
  })

  sourceCurrencySelectElement.addEventListener('input', (e) => {
    sourceCurrency = e.target.value
    const exchangeResult = calculateExchageValue(exchangeAmount, targetCurrency, rates)
    console.log('Its working', exchangeResult, targetCurrency)
    renderResult(exchangeResult, targetCurrency)
  })
}

app()
