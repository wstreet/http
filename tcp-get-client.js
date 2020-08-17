const net = require('net')


const ReadyState = {
  UNSET: 0,
  OPENED: 1,
  HEADERS_RECEVIVED: 2,
  LOADING: 3,
  DONE: 4
}

class XMLHttpRequest {
  constructor() {
    this.readyState = ReadyState.UNSET
    this.headers = {
      'Connection': 'keep-alive'
    }
  }

  open(method, url) {
    this.method = method || 'GET'
    this.url = url
    const { hostname, port, path } = require('url').parse(url)
    this.hostname  =hostname
    this.port = port
    this.path = path
    this.headers['Host'] = `${hostname}:${port}`
    this.socket = net.createConnection({
      hostname,
      port
    }, () => {
      this.socket.on('data', data => {
        data = data.toString()
        console.log('--data--', data)
        const [response, bodyRows] = data.split('\r\n\r\n')
        const [statusLine, ...headerRows] =response.split('\r\n')
        const [, status, statusText] = statusLine.split(' ')
        this.status = status
        this.statusText = statusText
        this.responseHeaders = headerRows.reduce((memo, row) => {
          const [key, value] = row.split(': ')
          memo[key] = value
          return memo
        }, {})

        this.readyState = ReadyState.HEADERS_RECEVIVED
        this.onreadystatechange && this.onreadystatechange()
        const [, body, ] = bodyRows.split('\r\n')

        this.readyState = ReadyState.LOADING
        this.onreadystatechange && this.onreadystatechange()

        this.response = this.responseText = body
        
        this.readyState = ReadyState.DONE
        this.onreadystatechange && this.onreadystatechange()
        this.onload && this.onload()
      })
    })
    this.readyState = ReadyState.OPENED
    this.onreadystatechange && this.onreadystatechange()
  }

  getAllResponseHeaders() {
    let result = ''
    for (const key in this.responseHeaders) {
      result += `${key}: ${this.responseHeaders[key]}\r\n`
    }
    return result
  }

  getResponseHeader(key) {
    return this.responseHeaders[key]
  }

  send() {
    const rows = []
    rows.push(`${this.method} ${this.url} HTTP/1.1`)

    const restRows = Object.entries(this.headers).map(([key, value]) => `${key}: ${value}`)
    rows.push(...restRows)
    const request = rows.join('\r\n') + '\r\n\r\n'
    console.log(request);
    this.socket.write(request)
  }

}

const xhr = new XMLHttpRequest()
xhr.onreadystatechange = ()=> {
  console.log('onreadystatechange', xhr.readyState)
}
xhr.open('GET', 'http://127.0.0.1:8080/get')

xhr.responseType = 'text'
// xhr.setRequestHeader('name', 'wstreet')
// xhr.setRequestHeader('age', '18')

xhr.send()