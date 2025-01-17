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
  const ratesQueryLink = `https://open.er-api.com/v6/latest/${currencyCode.toUpperCase()}`

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

const renderInitialCurrenciesLists = (currencyNamesList, sourceCurrency, targetCurrency) => {
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

const renderRatesTable = (converter) => {
  const createTableElement = (text = '') => {
    const newElement = document.createElement('span')
    newElement.classList.add('col-4')
    newElement.textContent = text

    return newElement
  }
  const ratesTableContainerElement = document.getElementById('ratesTable')
  
  const startingText = `${converter.amount} ${converter.sourceCurrency} = `
  const result = converter.calculateExchangeTable()
  const resultElements = result.map((rate) => createTableElement(`${startingText}${rate} ${converter.targetCurrency}`))
  
  resultElements.forEach((el) => {
    ratesTableContainerElement.appendChild(el)
  })
}

const calculateExchageValue = (sum, targetCurrencyCode, rates) => (sum * rates[targetCurrencyCode]).toFixed(3)

const initializeApp = async () => {
  const converter = {
    rates: null,
    amount: DEFAULT_AMOUNT,
    sourceCurrency: DEFAULT_CURRENCY,
    targetCurrency: DEFAULT_CURRENCY,
    calculateExchangeResult() {
      return (this.amount * this.rates[this.targetCurrency.toUpperCase()]).toFixed(3)
    },
    calculateExchangeTable() {
      const tableArray = []
      const tableRatesCodes = Object.keys(converter.rates).slice(1, 10)

      for (let i = 0; i < 9; i += 1) {
        const result = this.amount * this.rates[tableRatesCodes[i].toUpperCase()].toFixed(3)
        tableArray.push(result)
      }

      return tableArray
    }
  }

  const { userCurrency, rates } = await fetchInitialData()
  
  converter.sourceCurrency = userCurrency
  converter.rates = rates

  return converter
}

const renderInitialApp = (converter) => {
  const { rates, sourceCurrency, targetCurrency } = converter;
  const currencyNamesList = Object.keys(rates).map((name) => name[0].toUpperCase() + name.slice(1).toLowerCase())

  renderInitialCurrenciesLists(currencyNamesList, sourceCurrency, targetCurrency)
  renderResult(converter.calculateExchangeResult(), targetCurrency)
}

const app = async () => {
  const converter = await initializeApp()
  renderInitialApp(converter)
  renderRatesTable(converter)

  const amountInputElement = document.getElementById('amountInput')
  const sourceCurrencySelectElement = document.getElementById('sourceCurrency')
  const targetCurrencySelectElement = document.getElementById('targetCurrency')

  amountInputElement.addEventListener('input', (e) => {
    const currentValue = e.target.value
    converter.amount = Number(currentValue)

    renderResult(converter.calculateExchangeResult(), converter.targetCurrency)
  })

  sourceCurrencySelectElement.addEventListener('input', async (e) => {
    sourceCurrency = e.target.value
    converter.sourceCurrency = sourceCurrency

    const { rates } = await fetchRatesData(sourceCurrency)
    converter.rates = rates

    renderResult(converter.calculateExchangeResult(), converter.targetCurrency)
  })

  targetCurrencySelectElement.addEventListener('input', (e) => {
    targetCurrency = e.target.value
    converter.targetCurrency = targetCurrency

    renderResult(converter.calculateExchangeResult(), converter.targetCurrency)
  })
}

app()
