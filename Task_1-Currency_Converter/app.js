const SUCCESS_CODE_API = 'success'
const DEFAULT_CURRENCY = 'USD'

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

const calculateExchageValue = (sum, targetCurrencyCode, rates) => sum * rates[targetCurrencyCode]

const renderInitialValues = () => {};

const app = async () => {
  const { userCurrency, rates } = await fetchInitialData()
  const currencyNamesList = Object.keys(rates).map((name) => name[0].toUpperCase() + name.slice(1).toLowerCase())
  const sourceCurrency = userCurrency
  const targetCurrency = DEFAULT_CURRENCY

  createInitialCurrenciesLists(currencyNamesList, sourceCurrency, targetCurrency)
  renderResult(calculateExchageValue(100000, targetCurrency, rates), targetCurrency)

  const sourceCurrencySelectElement = document.getElementById('sourceCurrency')
  const targetCurrencySelectElement = document.getElementById('targetCurrency')
  const amountInputElement = document.getElementById('amountInput')
  const resultValueTextElement = document.getElementById('resultValue')

  //TODO - APP STRUCTURE
  // 2. Add handlers

  amountInputElement.addEventListener('change', (e) => {
    const currentValue = e.target.value;
    console.log(currentValue);
  })
}

app()
