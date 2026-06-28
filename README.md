# Windows 11 キッティングチェックリスト

Windows 11 Pro 24H2 を新規購入時の状態から、Microsoftアカウントに紐づけずにキッティングする際の設定項目チェックリストです。HTML/CSS/JSのみで作られた静的Webアプリで、ビルド不要、スマホのブラウザでそのまま使えます。

- `index.html` … トップ画面(セキュリティレベル選択・カスタマイズ)
- `checklist.html` … 設定項目チェックリスト画面
- `detail.html` … 項目別の設定変更手順画面

## 1. リポジトリの取得

```bash
git clone <このリポジトリのURL>
cd agit
git checkout claude/windows-11-setup-mobile-0m31r3
```

すでにクローン済みの場合は以下でブランチを取得します。

```bash
git fetch origin claude/windows-11-setup-mobile-0m31r3
git checkout claude/windows-11-setup-mobile-0m31r3
git pull
```

## 2. ローカルサーバーを起動する

ビルドは不要ですが、`file://` で直接開くとブラウザによってはチェック状態の保存(localStorage)が不安定になるため、簡易HTTPサーバーで配信することを推奨します。

**Python3 がある場合**

```bash
cd agit
python3 -m http.server 8000
```

**Node.js がある場合**

```bash
cd agit
npx serve -l 8000
```

起動後、PCのブラウザで `http://localhost:8000/index.html` を開いて動作確認できます。

## 3. スマホから使う

PCとスマホを**同じWi-Fiネットワーク**に接続したうえで、PCのローカルIPアドレスを調べます。

```bash
# Windows
ipconfig
# 「IPv4 アドレス」を確認(例: 192.168.1.10)

# macOS / Linux
ifconfig | grep "inet "
```

スマホのブラウザで以下のURLにアクセスします(IPアドレスは上で確認した値に置き換え)。

```
http://192.168.1.10:8000/index.html
```

ホーム画面に追加すれば、アプリのように起動できます(Safari/Chromeの「ホーム画面に追加」機能)。

## 4. 終了方法

サーバーを起動したターミナルで `Ctrl + C` を押すと停止します。

## 補足

- チェック状態はブラウザの `localStorage` に保存されます。ブラウザ・端末ごとに別々に保存されるため、PCとスマホで共有はされません。
- サーバー停止後も再度同じコマンドで起動すれば、保存済みのチェック状態(同一ブラウザの場合)はそのまま復元されます。
