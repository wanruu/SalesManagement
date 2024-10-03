const express = require('express')
const cors = require('cors')
// const path = require('path')
const app = express()


app.use(express.json())
app.use(cors())
// 静态文件托管
// app.use(express.static(path.join(__dirname, 'files')))


// routes
require('./routes')(app)


const start = (port) => {
    app.listen(port, () => {
        console.log(`Listening at port ${port}`)
    })
}


// start(8888)
module.exports = {
    start: start
}

if (process.argv.length >= 3) {
    start(process.argv[2])
}
