const http = require('http')
const url = require('url')
const fs = require('fs')
const path = require('path')


const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url)
  if(['/get.html', '/post.html'].includes(pathname)) {
    res.statusCode = 200
    res.setHeader('name', 'wstreet')
    res.setHeader('age', '25')
    // 同步模式读取文件
    const content = fs.readFileSync(path.join(__dirname, 'static', pathname))
    res.end(content)
  } else if(pathname === '/get'){
    console.log(req.method)
    console.log(req.url)
    console.log(req.method)
    res.statusCode = 200
    res.setHeader('Content-type', 'text/html')
    res.end('get')
  } else if(pathname === '/post') {

    let buffers = []
    // tcp传输的时候有可能会分包
    req.on('data', data => {
      buffers.push(data)
    })

    req.on('end', data => {
      console.log(req.method);
      console.log(req.url);
      console.log(req.headers);

      res.statusCode = 200
      let body = Buffer.concat(buffers)
      console.log('body', body)

      res.setHeader('Content-type', 'text/plain')
      res.write(body)
      res.end()
    })




  } else {
    res.statusCode = 404
    res.end()
  }
})
server.listen(8080, () => {
  console.log('http://127.0.0.1:8080')
})