# Termux ローカルLLMチャットアプリ 動作マニュアル

Android の Termux 上で、Ollama と通信する最小構成のチャットWebアプリ
（`server.js` + `index.html`）を動かすための手順です。Termuxのインストール
は完了している前提で、それ以降の作業をすべて記載します。

構成ファイル:
- `server.js` — Node標準モジュールのみで動くHTTPサーバー（依存パッケージなし）
- `index.html` — ブラウザで表示するチャット画面（HTML/CSS/JS全部入り）

注意: Ollama公式バイナリは glibc 前提でビルドされており、Termuxの素の環境
（Android標準のbionic libc）では直接実行できません。そのため
`proot-distro` で Ubuntu 環境を用意し、その中に Ollama をインストールします。
proot は通常のプロセスとしてホストと同じネットワークを使うため、Ubuntu内で
起動した Ollama (`127.0.0.1:11434`) は Termux本体（Node.jsアプリ側）からも
そのままアクセスできます。

---

## 0. 事前準備（ストレージ権限・パッケージ更新）

Termuxを開き、以下を実行します。

```bash
termux-setup-storage   # 初回のみ。ストレージアクセスを許可するダイアログが出ます
pkg update -y && pkg upgrade -y
```

## 1. Node.js のインストール

```bash
pkg install nodejs-lts -y
node -v   # v18以上であることを確認
```

## 2. proot-distro と Ubuntu 環境のインストール

```bash
pkg install proot-distro -y
proot-distro install ubuntu
```

ダウンロードが完了するまで数分かかります（数百MB）。

## 3. Ubuntu 環境に入って Ollama をインストール

```bash
proot-distro login ubuntu
```

ここから先はUbuntu環境内のコマンドです。

```bash
apt update && apt upgrade -y
curl -fsSL https://ollama.com/install.sh | sh
```

## 4. Ollama サーバーを起動する（このセッションは起動したままにする）

Ubuntu環境内（同じシェル）で:

```bash
ollama serve
```

このコマンドはフォアグラウンドで動き続けます。**このTermuxセッションは
閉じずに開いたままにしてください。**

## 5. 別セッションでモデルを取得する

Termuxの画面を左端からスワイプして「New session」を開き、新しいタブで
再度Ubuntu環境に入ります。

```bash
proot-distro login ubuntu
ollama pull qwen3:1.7b
```

ダウンロード完了後、動作確認:

```bash
curl http://localhost:11434/api/tags
```

モデル一覧がJSONで返ってくればOKです。このセッションはもう閉じて構いません。

## 6. アプリ本体を配置する

`server.js` と `index.html` をTermuxのホームディレクトリ（または任意の
作業フォルダ）に置きます。すでにこのリポジトリをクローン済みの場合はその
ディレクトリに `cd` してください。

```bash
cd ~/agit   # リポジトリのパスに合わせて変更
```

## 7. チャットサーバーを起動する（通常のTermuxセッションでよい）

ここは **proot-distroに入らず**、通常のTermuxセッションで実行します。
（手順4のOllamaセッションはそのまま起動したままにしておきます。新しい
セッションを開いて実行してください。）

```bash
node server.js
```

以下のように表示されれば起動成功です。

```
サーバーを起動しました: http://localhost:3000
使用モデル: qwen3:1.7b
Ollama API: http://localhost:11434/api/chat
```

このセッションも閉じずに開いたままにしてください。

## 8. ブラウザでアクセスする

スマホのブラウザ（Chromeなど）で以下を開きます。

```
http://localhost:3000
```

メッセージを入力して送信すると、Ollamaからの応答がストリーミング表示
されます。会話履歴は `./data/history.json` に自動保存され、次回起動時に
復元されます。「履歴クリア」ボタンで履歴を削除できます。

---

## モデルやポートを変更したい場合

```bash
OLLAMA_MODEL=qwen3:4b node server.js   # 使用モデルを変更
PORT=8080 node server.js               # アプリのポートを変更
```

---

## バックグラウンドで動かし続けたい場合

Termuxはアプリがバックグラウンドに回ると、Androidの省電力機能により
プロセスが停止されることがあります。長時間動かす場合は以下を検討してください。

- Termux通知バーから「Acquire wakelock」を有効にする、または
  ```bash
  termux-wake-lock
  ```
  （`pkg install termux-api` が必要な場合があります）
- Android設定でTermuxの電池最適化を無効化する

---

## トラブルシューティング

| 症状 | 原因・対処 |
|---|---|
| ブラウザに「Ollamaに接続できません」と出る | 手順4の `ollama serve` セッションが落ちていないか確認 |
| `EADDRINUSE` エラーで `node server.js` が起動しない | 既に起動中の `node server.js` がある。`pkill -f "node server.js"` で終了するか `PORT` を変更 |
| `ollama pull` がストレージ不足で失敗する | 空き容量を確認（`qwen3:1.7b` は1GB以上必要）。不要なファイルを削除 |
| Termuxを閉じると応答が止まる | 上記「バックグラウンドで動かし続けたい場合」を参照 |
| `curl http://localhost:11434/api/tags` が失敗する | proot-distro内で `ollama serve` が起動しているか、別セッションで確認 |
