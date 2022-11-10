import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';
import { connection } from './connection/connection-mysql.js';
import * as responseFunction from './functions/response-function.js';

var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

connection.connect();

var event = [];
connection.query('SELECT * FROM events', async function(err, result) {
  if(err) throw err
  event = result
})

app.post('/api', async (req, res) => {
  // var requestText = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  
  const responseUser = await fetch(`https://api.line.me/v2/bot/profile/${sender}`, {
    method: "GET", 
    headers: responseFunction.LINE_HEADER
  })
  var user = await responseUser.json()

  console.log(req.body.events[0])

  // if (requestText === 'List') {
  //   await responseFunction.sendEvent(sender, event)
  // }
  res.sendStatus(200)
})

// app.post('/api/join')

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})