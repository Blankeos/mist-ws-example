import { createSignal, For, onMount } from "solid-js";

export default function Page() {
  let ws: WebSocket;

  const [name, setName] = createSignal("Carlo");

  const [connectionStatus, setConnectionStatus] = createSignal(false);
  const [messageInput, setMessageInput] = createSignal("Hello there!");
  const [messages, setMessages] = createSignal<string[]>(["Message 1"]);

  onMount(() => {
    ws = new WebSocket("ws://localhost:4001/ws");

    // Event handler for when the connection is established
    ws.onopen = function (event) {
      console.log("OPEN");
      setConnectionStatus(true);
      ws.send("WebSocket is open now.");
    };

    // Event handler for when a message is received from the server
    ws.onmessage = function (event) {
      setMessages((messages) => [...messages, event.data]);
      console.log("Message from server:", event.data);
    };

    // Event handler for when the connection is closed
    ws.onclose = function (event) {
      console.log("WebSocket is closed now.");
    };

    // Event handler for when an error occurs
    ws.onerror = function (error) {
      console.log("WebSocket error:", error);
    };
  });

  return (
    <>
      <div>
        <h1>My Vike + Solid app</h1>

        <div>
          Connection Status:
          <input
            type="checkbox"
            readOnly
            checked={connectionStatus()}
            onChange={(e) => setConnectionStatus(e.currentTarget.checked)}
          />
        </div>
        <div>
          Current Name:
          <input type="text" value={name()} onInput={(e) => setName(e.currentTarget.value)} />
        </div>
        <br />

        <input
          type="text"
          value={messageInput()}
          onInput={(e) => setMessageInput(e.currentTarget.value)}
        />
        <button
          onClick={() => {
            ws.send(messageInput());
          }}
        >
          Send Message
        </button>

        <div>
          <h2>Messages:</h2>
          <For each={messages()}>{(message) => <p>{message}</p>}</For>
        </div>
      </div>
    </>
  );
}

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button type="button" onClick={() => setCount((count) => count + 1)}>
      Counter {count()}
    </button>
  );
}
