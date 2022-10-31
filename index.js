import fetch from 'node-fetch';
import express from 'express';
import bodyParser from 'body-parser';
import request from 'request';
import { connection } from './connection-mysql.js';
// import { Verifier } from 'academic-email-verifier';

var app = express()

// let isAcademic = await Verifier.isAcademic('pongpichet.sk@mail.kmutt.ac.th');
// console.log(isAcademic)

const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
const LINE_HEADER = {
  "Content-Type": "application/json",
  "Authorization": "Bearer VXLwVklleTDFgPnUoLZbiYaiCOZJSxVKN5fWM1ggbqOY1knDJ8PV+N7e5mUK5Cq/hGW2mk2mcVGl+rZ33++9XMqzt6e+BTX7EhV+T/Pj6zzBV08QOi6yO4ErNcw0OU2ijJjEXEQ5M3g0ctwyb1hPmAdB04t89/1O/w1cDnyilFU="
};

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

connection.connect();

var event = [];
connection.query('SELECT * FROM events', async function(err, result) {
  if(err) throw err
  event = result
})

app.get('/test', async (req, res) => {
  res.send(event)
})

app.post('/api', async (req, res) => {
  var text = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  // var replyToken = req.body.events[0].replyToken
  
  const responseUser = await fetch(`https://api.line.me/v2/bot/profile/${sender}`, {
    method: "GET", 
    headers: LINE_HEADER
  })
  var user = await responseUser.json()

  if (text === 'สวัสดี' || text === 'Hello' || text === 'hello') {
    await sendText(sender, user.displayName)
  }

  if (text === 'List') {
    await newSendEvent(sender, event)
    console.log(event)
  }
  res.sendStatus(200)
})

async function sendText (sender, displayName) {
  let data = {
    to: sender,
    messages: [
      {
        type: 'text',
        text: 'ยินดีต้อนรับคุณ ' + displayName + ' เข้าสู่ EventMod'
      }
    ]
  }
  request({
    headers: LINE_HEADER,
    url: `${LINE_MESSAGING_API}/push`,
    method: 'POST',
    body: data,
    json: true
  }, function (err, res, body) {
    if (err) console.log('error')
    if (res) console.log('success')
    if (body) console.log(body)
  })
}

async function newSendEvent (sender, event) {

  let column = []
  for (let index = 0; index < event.length; index++) {
    let x = {
      type: "bubble",
      defaultAction: {
          type: "uri",
          label: event[index].eventTitle,
          uri: `https://www.eventmod.net/each/${event[index].eventID}`
        },
      hero: {
        type: "image",
        url: `https://www.eventmod.net/api/Files/${event[index].eventCover}`,
        size: "full",
        aspectRatio: "2:1"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: event[index].eventTitle,
            wrap: true,
            weight: "bold"
          },
          {
            type: "separator"
          },
          {
            type: "text",
            text: event[index].eventShortDescription,
            wrap: true
          }
        ]
      },
      footer: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "message",
              label: "Join Event",
              text: "Already Join " + event[index].eventTitle
            }
          }
        ]
      }
    }
    column.push(x)
  }
    request({
      method: "POST",
      uri: `${LINE_MESSAGING_API}/push`,
      headers: LINE_HEADER,
      body: JSON.stringify({
        to: sender,
        messages: [
          {
            type: "flex",
            altText: "Show Event",
            contents: {
              type: "carousel",
              contents: column
            }
        }
        ]
      })
    }, function (err, res, body) {
      if (err) console.log('error')
      if (res) console.log('Done')
      if (body) console.log('3: '+ body)
    })
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})