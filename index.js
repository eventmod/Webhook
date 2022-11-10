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
  if(err) {console.log(err)}
  else {event = result}
})

app.post('/api', async (req, res) => {
  var requestEvent = req.body.events[0]
  var sender = requestEvent.source.userId
  
  const responseUser = await fetch(`https://api.line.me/v2/bot/profile/${sender}`, {
    method: "GET", 
    headers: responseFunction.LINE_HEADER
  })
  var user = await responseUser.json()

  if(requestEvent.type === 'message') {
    const requestText = requestEvent.message.text

    if (requestText === 'List') {
      await responseFunction.sendEvent(sender, event)
    }

  } else if(requestEvent.type === 'postback') {
    const dataPostback = requestEvent.postback.data
    const action = dataPostback.split("&")[0].split("=")[1]
    const eventId = dataPostback.split("&")[1].split("=")[1]

    var eventTitle = "";
    connection.query('SELECT event_title FROM events WHERE event_id = ' + eventId, async (err, result) => {
      if(err) {console.log(err)}
      else {eventTitle = await result[0].event_title}
    })

    if(action === 'join') {
      await responseFunction.joinEvent(sender, user, eventId, eventTitle)
      // let lineaccID = 0;
      // connection.query('SELECT lineacc_id FROM lineaccounts WHERE lineacc_userid = "' + sender + '"', async function(err, result) {
      //   if(err) {console.log(err)}
      //   else {lineaccID = result[0].lineacc_id}
      // })
      // let hasJoin = false;
      // connection.query('SELECT eventjoined_id FROM eventsjoined WHERE event_id = ' + eventId + ' && lineacc_id = ' + lineaccID, async function(err, result) {
      //   if(err) {console.log(err)}
      //   else {
      //     console.log("hasJoinResult: " + result[0])
      //     hasJoin = result[0] === undefined ? true : false
      //   }
      // })
      // if(hasJoin) {
      //   let hasJoinLink = false;
      //   let joinLink = undefined;
      //   connection.query('SELECT event_joinlink FROM events WHERE event_id = ' + eventId, async (err, result) => {
      //     if(err) {console.log(err)}
      //     else {joinLink = result[0], hasJoinLink = joinLink === undefined ? true : false;}
      //   })
      //   if(hasJoinLink) {
      //     connection.query('INSERT INTO eventsjoined(event_id, lineacc_id) VALUES (' + eventId + ', ' + lineaccID + ')', async(err, result) => {
      //       if(err) {console.log(err)}
      //       else {console.log("Inset: " + result)}
      //     })
      //   } else {
      //     window.location.replace(joinLink)
      //   }
      // } else {
      //   await responseFunction.sendText(sender, user.displayName + " has already join " + eventTitle + ".")
      // }
    }
  }

  res.sendStatus(200)
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})