## Slack Messages

## Setup 
```
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"schedule":"2024-01-19 17:31:00.000", "channelName": "#general", "message": "hello world"}' \
  http://localhost:3000/messages
```