const net = require('net')

/**
 * 创建一个tcp服务器，每当客户端来连接了，就会为他创建一个socket
 * TCP是协议，net是实现TCP协议的node模块
 * HTTP是协议，http（node中的http）是实现HTTP协议的模块
 */
const server = net.createServer(socket => {
  // 解析请求
  socket.on('data', data => {
    debugger
    const request = data.toString()
    const [requestLine, ...headerRows] = request.split('\r\n')
    const [method, url] = requestLine.split(' ')

    const headers = headerRows.slice(0, -2).reduce((memo, row) => {
      const [key, value] = row.split(': ')
      memo[key] = value
      return memo
    }, {})

    console.log('method', method)
    console.log('url', url)
    console.log('headers', headers)


    // 构建响应
    let rows = []
    rows.push('HTTP/1.1 200 OK')
    rows.push('Content-type: text/plain')
    rows.push(`Date: ${new Date().toGMTString()}`)
    rows.push('Connection: keet-alive')
    rows.push('Transfer-Encodeing: chunked')
    let body = 'get'
    rows.push(`Content-Length: ${Buffer.byteLength(body)}`) // 返回这个字符的字节长度

    rows.push(`\r\n${Buffer.byteLength(body).toString(16)}\r\n${body}\r\n0`) // 0表示响应结束

    let response = rows.join('\r\n')

    console.log(response)

    socket.end(response)

  })
})

server.listen(8080)