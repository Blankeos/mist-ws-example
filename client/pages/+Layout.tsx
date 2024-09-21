import { createSignal, type FlowProps } from "solid-js";

export default function RootLayout(props: FlowProps) {
  return <div>{props.children}</div>;
}

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button type="button" onClick={() => setCount((count) => count + 1)}>
      Root Counter {count()}
    </button>
  );
}
