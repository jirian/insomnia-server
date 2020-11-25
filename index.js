const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const srp = require("srp-js")

app.use(bodyParser.json())

app.post('/notification', (req, res) => {
    res.send('Hello World!');
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const users = {
    "me@jiriantonu.cz": {
        saltAuth: "bdfbc137885756e71a7224239456e494557456a7b97b04577479fb9859850d82",
        saltKey: "ef1450a8daae901a3dc561489e32fb32a4eb21dcb958d911075978956ec08e3a",
        username: "me@jiriantonu.cz",
        password: "sfsdfsdf564"
    }
};
let session = {};

app.post('/auth/login-s', (req, res) => {
    res.json({
        "saltAuth": users[req.body.email].saltAuth,
        "saltKey": users[req.body.email].saltKey
    });
});

app.post('/auth/login-a', (req, res) => {
    const server = srp.Server(
        srp.params[2048],
        srp.computeVerifier(
            srp.params[2048],
            new Buffer(users[req.body.email].saltKey),
            new Buffer(req.body.email),
            new Buffer(users[req.body.email].password)
        ),
        Buffer.from("test")
    );

    const id = makeid(6);

    server.setA(Buffer.from(req.body.srpA));
    session[id] = server;

    res.json({
        sessionStarterId: id,
        srpB: server.computeB().toString("hex")
    });
});

app.post('/auth/login-m1', (req, res) => {
    const currentSession = session[req.body.sessionStartedId];
    console.log(currentSession.checkM1(req.body.srpM1));
});

app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})