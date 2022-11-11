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

    connection.query('SELECT event_title FROM events WHERE event_id = ' + eventId, async (err, result) => {
      if(err) {console.log(err)}
      var eventTitle = result[0].event_title
      if(action === 'join') {
        connection.query('SELECT lineacc_id FROM lineaccounts WHERE lineacc_userid = "' + sender + '"', async function(err, result) {
          if(err) {console.log(err)}
          var lineaccID = result[0].lineacc_id
          if(lineaccID !== undefined) {
            connection.query('SELECT event_joinlink FROM events WHERE event_id = ' + eventId, async function(err, result) {
              if(err) {console.log(err)}
              var joinLink = result[0].event_joinlink
              var hasJoinLink = joinLink === null ? true : false
              console.log(joinLink)
              if(hasJoinLink) {
                connection.query('SELECT eventjoined_id FROM eventsjoined WHERE event_id = ' + eventId + ' && lineacc_id = ' + lineaccID, async (err, result) => {
                  if(err) {console.log(err)}
                  var hasJoin = result[0] === undefined ? true : false
                  if(hasJoin) {
                    connection.query('INSERT INTO eventsjoined(event_id, lineacc_id) VALUES (' + eventId + ', ' + lineaccID + ')', async(err, result) => {
                      if(err) {console.log(err)}
                      else {
                        await responseFunction.sendText(sender, "Join " + eventTitle + " successfully.")
                      }
                    })
                  } else {
                    await responseFunction.sendText(sender, user.displayName + " has already join " + eventTitle + ".")
                  }
                })
                
              } else {
                await responseFunction.sendText(sender, "Join with this link:\n" + joinLink)
              }
            })
          } else {
            res.redirect("https://liff.line.me/1657624777-ZRExJL7b")
          }
        })
      }
    })
  }

  res.sendStatus(200)
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})