# hapi_server_default
hapi를 이용한 노드 서버 + websocket 활용한 통신 기법 연구

+ npm install --save express@4.10.2
+ npm install --save socket.io

```
<script src="/socket.io/socket.io.js"></script>
<script src="http://code.jquery.com/jquery-1.11.1.js"></script>
<script>
  var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
</script>
```
