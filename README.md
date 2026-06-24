# 起動マニュアル

## 前提

- Termux インストール済み
- Ollama インストール済み（起動コマンドが分かればOK）
- `server.js` と `index.html` を内部ストレージの **Documents** フォルダに
  配置済み（例: `内部ストレージ/Documents/agit-chat/` に2ファイルをコピー）

## 手順

### 1. （初回のみ）内部ストレージへのアクセスを許可

```bash
termux-setup-storage
```

許可ダイアログが出たら「許可」を選択します。

### 2. （`node` コマンドが無い場合のみ）Node.js をインストール

```bash
pkg install nodejs-lts -y
```

### 3. Ollama を起動する

```bash
ollama serve
```

※ proot-distro（Ubuntu環境）経由でインストールしている場合は、先に
`proot-distro login ubuntu` を実行してからこのコマンドを実行してください。

**このセッションは閉じずに、起動したままにしてください。**

### 4. 新しいTermuxセッションを開く

画面を左端からスワイプ →「+ New session」をタップ。

### 5. アプリを起動する

```bash
cd ~/storage/shared/Documents/agit-chat
node server.js
```

以下のように表示されれば起動成功です。

```
サーバーを起動しました: http://localhost:3000
使用モデル: qwen3:1.7b
Ollama API: http://localhost:11434/api/chat
```

このセッションも閉じずに開いたままにしてください。

### 6. ブラウザで開く

```
http://localhost:3000
```

---

起動後の使い方は [USAGE.md](./USAGE.md) を参照してください。
