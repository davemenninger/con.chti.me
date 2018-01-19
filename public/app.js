var ws_uri = location.href.replace(/^http/, 'ws');
var ws = new WebSocket(ws_uri);
var islands;
var canvas = document.getElementById('map1');
var mouse_x = 0;
var mouse_y = 0;
var input = $('#input');

ws.onopen = function () {
  $('#connection_status').html('connected');
    ws.send(JSON.stringify({
      cmd: 'init'
    }));
};

ws.onmessage = function (msg) {
    append_li('ws.onmessage: "' + msg.data + '" from server');
    var response = JSON.parse(msg.data);
    islands = response.islands;

    console.log(islands);
    draw();
};

ws.onclose = function(event) {
    $('#connection_status').html( 'lost connection <a href="javascript:window.location.href=window.location.href">reload</a>');
};


input.change(function () {
    var msg = input.val();
    ws.send(JSON.stringify({
      cmd: msg
    }));
    append_li('"' + msg + '" to server');
    input.val("");
});

var draw = function()
{
  if (canvas.getContext) {
      var context = canvas.getContext("2d");

      // background
      context.fillStyle = "#1284DA";
      context.fillRect(0, 0, canvas.width, canvas.height);

      // islands
      for ( var i in islands )
      {
          context.fillStyle = 'yellow';
          context.beginPath();
          context.arc(islands[i].x, islands[i].y, 30, 0, Math.PI * 2, true);
          context.fill();

          context.fillStyle = 'green';
          context.beginPath();
          context.arc(islands[i].x, islands[i].y, 28, 0, Math.PI * 2, true);
          context.fill();
      }

      var island1 = { x: 70, y: 280};
      var island2 = { x: 300, y: 175};

      context.beginPath();
      context.moveTo(island1.x,island1.y);
      context.lineTo(island2.x,island2.y);
      context.stroke();

      var percent = 0.71;

      var guy = {
          x: ((island2.x-island1.x)*percent)+island1.x,
          y: ((island2.y-island1.y)*percent)+island1.y,
      };

      context.fillStyle = 'orange';
      context.beginPath();
      context.arc(guy.x,guy.y,10,0,Math.PI*2,true);
      context.fill();
  }
}


document.onreadystatechange = function() {
    if (document.readyState == "complete") {

        canvas.addEventListener('mousemove', function(evt) {
            getMousePos(canvas, evt);
            //draw();
        },
        false);

      canvas.addEventListener('click', function(event) {
      console.log('click');
            selected_cell = {
                x: mouse_x ,
                y: mouse_y
            };
            ws.send(JSON.stringify({
                cmd: 'CLICK',
                x: selected_cell.x,
                y: selected_cell.y
            }));
            if( selected_cell.x == 3 )
            {
                ws.send(JSON.stringify({
                    cmd: 'AUTHENTICATE',
                    name: 'bender',
                    code: 'bending'
                }));
            }
            draw();
        },
        false);

        draw();
    }
};

var append_li = function (str) {
  $('#messages').append($('<li>').text(str));
};

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
    mouse_x = (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    mouse_y = (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
};
