import request from 'request';

class messageFunction {
  async sendText (sender, displayName) {
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
}