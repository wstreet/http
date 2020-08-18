
/**
 * 使用状态及来解析请求，获取请求行  请求头  请求体
 */

let LF = 10, // 行行
    CR = 13, // 回车
    SPACE = 32, // 空格
    COLON = 58; // 冒号

let INIT = 0,
    START = 1,
    REQUEST_LINE = 2,
    HEADER_FIELD_START = 3,
    HEADER_FIELD = 4,
    HEADER_VALUE_START = 5,
    HEADER_VALUE = 6,
    BODY = 7


class Parser {

  constructor() {
    this.state = INIT
  }

  parse(buffer) {
    let  requestLine = '',
        headers = {},
        body = '',
        i = 0,
        char,
        headerField = '',
        headerValue = '';

    this.state = START
    for(let i = 0; i < buffer.length; i++) {
      char = buffer[i]
      switch(this.state) {
        case START:
          this.state = REQUEST_LINE
          this.requestLineMark = i // 记录请求行开始的索引
        case REQUEST_LINE:
          if (char === CR) { // 回车
            requestLine = buffer.toString('utf-8', this.requestLineMark, i)
          } else if(char === LF) { // \n
            this.state = HEADER_FIELD_START
          }
          break
        case HEADER_FIELD_START:
          if(char === CR) {
            // 如果是这样，说明下面给处理请求体了
            this.state = BODY
            this.bodyMark = i + 2
          } else {
            this.state = HEADER_FIELD
            this.headerFieldMark = i
          }
        case HEADER_FIELD:
          if(char === COLON) { // :
            headerField = buffer.toString('utf-8', this.headerFieldMark, i)
            this.state = HEADER_VALUE_START
          }
          break;
        case HEADER_VALUE_START:
          if (char === SPACE) {
            break
          }
          this.headerValueMark = i
          this.state = HEADER_VALUE
        case HEADER_VALUE:
          if(char === CR) {
            headerValue = buffer.toString('utf-8', this.headerValueMark, i)
            headers[headerField] = headerValue
            headerField = headerValue = ''
          } else if (char === LF) {
            this.state = HEADER_FIELD_START
          }
          break
      }
    }

    let [method, url] = requestLine.split(' ')
    body = buffer.toString('utf-8', this.bodyMark)

    return {
      method,
      url,
      headers,
      body
    }
  }
}

module.exports = Parser

// 为什么实际实现中不能用split分割
// 因为数据传输是流式的不连续的  二期 可能很大


/** 
POST /post HTTP/1.1\r\n
Host: 127.0.0.1:8080\r\n
Connection: keep-alive\r\n
Content-Length: 28\r\n
Content-type: application/json\r\n
\r\n
{"name":"wstreet7","age":18}
*/


