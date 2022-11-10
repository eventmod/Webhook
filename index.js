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

    console.log(action)
    console.log(eventId)

    // const eventTitle = ""
    // connection.query('SELECT event_title FROM events WHERE event_id = ' + eventId, async (err, result) => {
    //   if(err) {console.log(err)}
    //   else {eventTitle = result}
    // })
    
    // if( action === 'join' ) {

    //   const lineaccID = 0;
    //   connection.query('SELECT lineacc_id FROM lineaccounts WHERE lineacc_userid = ' + sender, async function(err, result) {
    //     if(err) {console.log(err)}
    //     else {lineaccID = result}
    //   })
    //   const hasJoin = false;
    //   connection.query('SELECT eventjoined_id FROM eventsjoined WHERE event_id = ' + eventId + ' && lineacc_id = ' + lineaccID, async function(err, result) {
    //     if(err) {console.log(err)}
    //     else {hasJoin = result === null ? false : true;}
    //   })

    //   if(hasJoin) {
    //     const hasJoinLink = false;
    //     const joinLink = null;
    //     connection.query('SELECT event_joinlink FROM events WHERE event_id = ' + eventId, async (err, result) => {
    //       if(err) {console.log(err)}
    //       else {joinLink = result, hasJoinLink = joinLink === null ? false : true;}
    //     })
    //     if(hasJoinLink) {
    //       connection.query('INSERT INTO eventsjoined(event_id, lineacc_id) VALUES (' + eventId + ', ' + lineaccID + ')')
    //     } else {
    //       window.location.replace(joinLink)
    //     }
    //   } else {
    //     await responseFunction.sendText(send, user.displayName + " have already join " + eventTitle + ".")
    //   }
    // }
  }

  res.sendStatus(200)
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})