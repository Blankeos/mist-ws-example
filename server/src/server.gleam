import gleam/bytes_builder
import gleam/erlang/process
import gleam/http/request.{type Request}
import gleam/http/response.{type Response}
import gleam/io
import gleam/iterator
import gleam/list
import gleam/option.{Some}
import gleam/otp/actor
import mist.{type Connection, type ResponseData}
import mist/internal/websocket.{type WebsocketConnection}

pub type State {
  State(clients: List(WebsocketConnection))
}

pub type MyMessage {
  Broadcast(String)
}

pub fn main() {
  let selector = process.new_selector()
  let state = State(clients: [])

  let not_found =
    response.new(404)
    |> response.set_body(mist.Bytes(bytes_builder.new()))

  let assert Ok(_) =
    fn(req: Request(Connection)) -> Response(ResponseData) {
      case request.path_segments(req) {
        ["ws"] ->
          mist.websocket(
            request: req,
            on_init: fn(conn) {
              io.println("Received a connection!")

              let a = [conn]
              let b = state.clients

              list.append(b, a)

              #(state, Some(selector))
            },
            on_close: fn(_state) { io.println("goodbye!") },
            handler: handle_ws_message,
          )
        _ -> not_found
      }
    }
    |> mist.new
    |> mist.port(4001)
    |> mist.start_http

  io.println("Server started on http://localhost:4001")
  process.sleep_forever()
}

fn handle_ws_message(state, conn, message) {
  io.debug(message)
  io.debug(state)

  case message {
    mist.Text("ping") -> {
      let assert Ok(_) = mist.send_text_frame(conn, "pong")

      actor.continue(state)
    }
    mist.Text(_) | mist.Binary(_) -> {
      actor.continue(state)
    }
    mist.Custom(Broadcast(text)) -> {
      let assert Ok(_) = mist.send_text_frame(conn, text)
      actor.continue(state)
    }
    mist.Closed | mist.Shutdown -> actor.Stop(process.Normal)
  }
}
