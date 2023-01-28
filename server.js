const fs = require('fs')
const http = require('http')
const { generateRandomString } = require('./utils')

/**
 * Http server config.
 */
const hostname = `127.0.0.1`
const port = 9999

const keyList = {}

/**
 * Create http server.
 */
const app = (req, res) => {
    if (req.method.toLowerCase() === `get`) {
        if (req.url === '/') {
            fs.readFile(`./index.html`, { encoding: 'utf-8' }, (err, data) => {
                if (err) {
                    res.writeHead(200, { 'Content-type': 'text/plain' }).end(`An error occured...`)
                }

                res.writeHead(200, { 'Content-type': 'text/html' }).end(data)
            })
        }
        else {
            res.writeHead(200, { 'Content-type': 'text/plain' }).end(`Server can receive http post request.`)
        }
    }
    else if (req.method.toLowerCase() === 'post') {
        if (req.url === '/send-unique-key') {
            let requestedData = []
        
            req.on('data', chunk => {
                requestedData.push(chunk)
            }).on('end', () => {
                const body = Buffer.concat(requestedData).toString()
                const params = JSON.parse(body)

                const randomString = generateRandomString(64)
                const buffer = Buffer.from(randomString)
                const ret = buffer.toString('base64')
                
                keyList[params.key] = ret

                res.writeHead(200, { 'Content-type': 'text/plain' }).end(ret)
            })
        } else if (req.url === '/send-login-key') {
            let requestedData = []
        
            req.on('data', chunk => {
                requestedData.push(chunk)
            }).on('end', () => {
                const body = Buffer.concat(requestedData).toString()
                const params = JSON.parse(body)

                const values = Object.values(keyList)
                const currentIndex = values.findIndex((item, i) => item === params.key)

                if (currentIndex > -1) {
                    const keys = Object.keys(keyList)
                    res.writeHead(200, { 'Content-type': 'text/plain' }).end(keys[currentIndex])
                }
                else {
                    res.writeHead(200, { 'Content-type': 'text/plain' }).end(`Your login key does not exist`)

                    process.kill(process.pid, 'SIGINT')
                }
            })
        }
        else {
            res.writeHead(200, { 'Content-type': 'text/plain' }).end(`Bad request.`)
        }
    }
}

const server = http.createServer(app)

/**
 * Start http server.
 */
server.listen(port, hostname, () => {
    console.log(`Server is running at http://${hostname}:${port}`)
})

process.on('SIGINT', app)