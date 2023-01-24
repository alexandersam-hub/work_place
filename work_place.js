const express = require('express')

const AuthorizationRouter = require('./routers/AuthorizationRouter')
const UserRouter = require('./routers/UserRouter')
const LocationRouter = require('./routers/LocationRouter')
const GameRouter = require('./routers/GameRouter')
const GameSocket = require('./sockets/GameSocket')

const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
const fs = require('fs');

const https = require('https');
const cors = require('cors')

const options = {
    cert: fs.readFileSync('../sslcert/fullchain.pem'),
    key: fs.readFileSync('../sslcert/privkey.pem')
};

require('dotenv').config()

const PORT = process.env.PORT || 8020
const PORT_HTTPS = process.env.PORT_HTPPS || 8520
    const app = express()

app.use(express.json({ limit: "50mb" }))
app.use(express.static(__dirname+'/public'));
app.use(cors({}));

app.use('/api/authorization', AuthorizationRouter)
app.use('/api/user', UserRouter)
app.use('/api/game', GameRouter)
app.use('/api/location', LocationRouter)

const start = async ()=>{
    try {
        await mongoose.connect(process.env.DB_URL)
        const server = https.createServer(options, app);
        server.listen(PORT_HTTPS)

        await GameSocket.init(server, process.env.URL_SERVER==='http://localhost:8020')

        app.listen(PORT,()=>{
            console.log(`start on port ${PORT}, ${PORT_HTTPS}`)
            if(process.env.URL_SERVER==='http://localhost:8020')
                console.log(`is local server`)
        })
    }
    catch (e) {
        console.log(e)
    }
}

start()