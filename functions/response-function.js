import request from 'request';

export const LINE_MESSAGING_API = "https://api.line.me/v2/bot/message";
export const LINE_HEADER = {
  "Content-Type": "application/json",
  "Authorization": "Bearer VXLwVklleTDFgPnUoLZbiYaiCOZJSxVKN5fWM1ggbqOY1knDJ8PV+N7e5mUK5Cq/hGW2mk2mcVGl+rZ33++9XMqzt6e+BTX7EhV+T/Pj6zzBV08QOi6yO4ErNcw0OU2ijJjEXEQ5M3g0ctwyb1hPmAdB04t89/1O/w1cDnyilFU="
};

export async function sendText (sender, text) {
  let data = {
    to: sender,
    messages: [
      {
        type: 'text',
        text: text
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

export async function sendEvent (sender, events) {

  let column = []
  for (let index = 0; index < events.length; index++) {
    let x = {
      type: "bubble",
      hero: {
        type: "image",
        url: `https://www.eventmod.net/api/Files/${events[index].event_cover}`,
        size: "full",
        aspectRatio: "2:1"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: events[index].event_title,
            wrap: true,
            weight: "bold"
          },
          {
            type: "separator"
          },
          {
            type: "text",
            text: events[index].event_shortdescription,
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
            action: {
              type: "uri",
              label: "Show Detail",
              uri: "https://liff.line.me/1657618262-bmwyAAVo?param=" + events[index].event_id
            }
          },
          {
            type: "button",
            style: "primary",
            action: {
              type: "postback",
              label: "Join Event",
              data: "action=join&eventid=" + events[index].event_id,
              displayText: "Already Join " + events[index].event_title
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