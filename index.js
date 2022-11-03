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
  var requestText = req.body.events[0].message.text
  var sender = req.body.events[0].source.userId
  
  const responseUser = await fetch(`https://api.line.me/v2/bot/profile/${sender}`, {
    method: "GET", 
    headers: responseFunction.LINE_HEADER
  })
  var user = await responseUser.json()

  if (requestText === 'List') {
    await responseFunction.sendEvent(sender, event)
  }

  // if (requestText === 'Verify KMUTT') {
  //   const text = "Please Send studentID 11 digits & KMUTT Mail \n\n Like this form ... \n\n 62130500000,example@kmutt.ac.th"
  //   await responseFunction.sendText(sender, text)
  // }

  // if (requestText.split(",")[0].length === 11 && (requestText.split(",")[1].split("@")[1] === "kmutt.ac.th" || requestText.split(",")[1].split("@")[1] === "mail.kmutt.ac.th")) {
  //   const studentID = requestText.split(",")[0]
  //   const kmuttMail = requestText.split(",")[1]
  //   console.log("studentID: " + studentID)
  //   console.log("KMUTT Mail: " + kmuttMail)
  // }

  // const patternEmail = requestText.split(" ")
  // if (patternEmail[0] === 'Email:') {
  //   const email = patternEmail[1]
  //   const componentEmail = email.split("@")
  //   if(componentEmail[1] === 'mail.kmutt.ac.th' || componentEmail[1] === 'kmutt.ac.th'){
  //     connection.query(`INSERT INTO lineaccounts (lineacc_userid, lineacc_studentid, lineacc_kmuttmail) VALUES ("${user.userId}", 'xxxxxxxxxxx', "${email}")`, (err, result) => {
  //       if(err) throw err
  //       console.log("Success")
  //       console.log(result)
  //     })
  //   }
  // }
  res.sendStatus(200)
})

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})