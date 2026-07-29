import "./style.css";

const app = document.querySelector<HTMLElement>("#app");

if (app === null) {
  throw new Error("Application root was not found.");
}

app.innerHTML = `
  <section class="starter">
    <p class="eyebrow">AI CODING BOOK</p>
    <h1>スタータープロジェクト</h1>
    <p>ここからコーディングエージェントと一緒にゲームを作ります。</p>
  </section>
`;
