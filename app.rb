require 'pp'
require 'eventmachine'
require 'bundler'
Bundler.require

Faye::WebSocket.load_adapter('thin')

$islands = [
  { :x => 100, :y => 200 },
  { :x => 30,  :y => 50  },
]

$clients = Set.new

EM.next_tick do
  EventMachine::PeriodicTimer.new(3) do
    puts 'TOCK'
  end
end


get '/' do
  if Faye::WebSocket.websocket?(request.env)
    ws = Faye::WebSocket.new(request.env,nil, {:ping => 10} )
    $clients.add(ws)

    ws.on(:open) do |event|
      puts 'On Open'
      ws.send({
        :islands => $islands,
      }.to_json )
      puts 'clients: ' + $clients.size.to_s
    end

    ws.on(:message) do |msg|
      puts 'On Message'
      do_msg( msg: msg )
      update_clients()
    end

    ws.on(:close) do |event|
      puts 'On Close'
      $clients.delete(ws)
      puts 'clients: ' + $clients.size.to_s
    end

    ws.rack_response
  else
    erb :index
  end
end

def update_clients
  $clients.each do |ws|
      ws.send({
        :islands => $islands,
      }.to_json )
  end
end

def do_msg( msg: )
  begin
    message = JSON.parse(msg.data)
    pp message
  rescue JSON::ParserError => e
    puts e.message
  end
end
