import fetch from 'node-fetch';
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
// var fetch = require('node-fetch')
var app = express()

app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

app.post('/api', async (req, res) => {
  var text = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  var replyToken = req.body.events[0].replyToken
  
  var user = ''
  fetch('https://api.line.me/v2/bot/profile/'+sender)
  .then((response) => response.json())
  .then((data) => user = data);

  // const response = await fetch('https://api.line.me/v2/bot/profile/'+sender)
  

  console.log(text, sender, replyToken)
  console.log(typeof sender, typeof text)
  // console.log(req.body.events[0])
  if (text === 'สวัสดี' || text === 'Hello' || text === 'hello') {
    sendText(sender, text, user.displayName)
    // console.log(user.displayName)
  }
  res.sendStatus(200)
})

function sendText (sender, text, displayName) {
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
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer VXLwVklleTDFgPnUoLZbiYaiCOZJSxVKN5fWM1ggbqOY1knDJ8PV+N7e5mUK5Cq/hGW2mk2mcVGl+rZ33++9XMqzt6e+BTX7EhV+T/Pj6zzBV08QOi6yO4ErNcw0OU2ijJjEXEQ5M3g0ctwyb1hPmAdB04t89/1O/w1cDnyilFU='
    },
    url: 'https://api.line.me/v2/bot/message/push',
    method: 'POST',
    body: data,
    json: true
  }, function (err, res, body) {
    if (err) console.log('error')
    if (res) console.log('success')
    if (body) console.log(body)
  })
}

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})