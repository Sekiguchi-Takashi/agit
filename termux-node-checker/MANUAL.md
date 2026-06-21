# Termux Node.js 動作確認 利用マニュアル

スマホの **Termux**（Androidのターミナルアプリ）上で **Node.jsが正常に動作するか** を確認するためのスクリプトです。

対象ファイル: `check-node.js`（このファイルと同じフォルダにあります）

---

## 1. できること

実行すると、以下を自動で確認します。

1. Node.js / npm のバージョンが取得できるか（インストール確認）
2. ローカルファイルの読み書きができるか
3. インターネット通信（HTTPS）ができるか
4. 内部ストレージの `Documents` フォルダへの書き込みができるか（`api-checker` の結果と同じ場所に、結果をチェックファイルとして保存します）

結果はターミナルに表示されると同時に、`check_node_日時.txt` というテキストファイルとして保存されます。

---

## 2. Termuxのインストール

1. **Google Play版のTermuxは更新が停止しているため使用しないでください。** 以下のいずれかからインストールします。
   - [F-Droid](https://f-droid.org/packages/com.termux/)（推奨）
   - [Termux公式GitHubのリリースページ](https://github.com/termux/termux-app/releases)
2. インストール後、Termuxを起動する

---

## 3. Node.jsのインストール

Termuxを起動し、以下のコマンドを順番に実行します。

```sh
pkg update -y && pkg upgrade -y
pkg install nodejs -y
```

インストール後、バージョンを確認します。

```sh
node -v
npm -v
```

バージョン番号が表示されればインストール成功です。

> 補足: 最新版で不具合が出る場合は `pkg install nodejs-lts -y` でLTS版を使うこともできます。

---

## 4. ストレージ（内部ストレージ）へのアクセス許可

チェックファイルを内部ストレージの `Documents` フォルダに保存するために、Termuxにストレージアクセス権限を与えます。

```sh
termux-setup-storage
```

実行するとAndroidの権限許可ダイアログが表示されるので「許可」を選択してください。これにより、Termux内に `~/storage/shared` というフォルダ（内部ストレージ本体への入り口）が作られます。

---

## 5. スクリプトをTermuxに配置する

`check-node.js` をTermuxから読み込める場所に置きます。一番簡単な方法は、内部ストレージ経由でコピーすることです。

1. スマホの「ファイル」アプリなどで `check-node.js` を内部ストレージの `Download` フォルダなどに置く（PCからの転送やブラウザでのダウンロードでも構いません）
2. Termuxで以下を実行し、Termuxのホームディレクトリにコピーする

```sh
cp ~/storage/shared/Download/check-node.js ~/check-node.js
```

（保存した場所が `Download` 以外の場合はパスを読み替えてください）

---

## 6. 実行方法

```sh
cd ~
node check-node.js
```

実行すると、各チェック項目の結果がターミナルに表示されます。

```
=== Termux Node.js 動作確認 ===
Node.js: v20.x.x
npm: 10.x.x
platform: linux / arm64
ローカルファイルI/O: OK
ネットワーク接続を確認中...
ネットワーク接続: OK (HTTP 204)

チェックファイルを保存しました: /data/data/com.termux/files/home/storage/shared/Documents/check_node_20250101_120000.txt

総合結果: OK - Node.jsはTermuxで正常に動作しています
```

---

## 7. 結果の見方

| 項目 | 内容 | NGの場合の主な原因 |
|---|---|---|
| Node.js / npm バージョン | インストールされているか | 3章のインストールが未完了、PATHが通っていない |
| ローカルファイルI/O | Node.jsからファイルの読み書きができるか | Termuxの権限設定が壊れている（通常は発生しません） |
| ネットワーク接続 | インターネットにHTTPSで接続できるか | Wi-Fi/モバイルデータが無効、機内モード、パケット制限 |
| 内部ストレージへの保存 | `Documents`フォルダに書き込めたか | 4章の `termux-setup-storage` が未実行・権限未許可 |

「総合結果」が **OK** であれば、Node.jsはTermux上で正常に動作しています。

---

## 8. チェックファイルの保存場所

- `termux-setup-storage` 実行済みであれば、内部ストレージの **`Documents`** フォルダに `check_node_YYYYMMDD_HHMMSS.txt` として自動保存されます（実体パス: `/storage/emulated/0/Documents/`）。
- ストレージ権限が未設定の場合は、代わりにスクリプトを実行したカレントディレクトリに保存され、ターミナルにその旨と保存先が表示されます。その場合は4章を実施してから再実行してください。

---

## 9. トラブルシューティング

| 症状 | 対処 |
|---|---|
| `node: command not found` | 3章のインストールをやり直す。`pkg install nodejs -y` がエラーなく完了しているか確認 |
| `pkg update` が失敗する／ミラーエラー | `termux-change-repo` を実行してミラーサーバーを変更する |
| ネットワーク接続がNG | Wi-Fi/モバイルデータの状態を確認。VPNやプロキシ設定がある場合は一時的に無効化して再試行 |
| Documentsフォルダに保存されない | `termux-setup-storage` を再実行し、Android側の権限ダイアログで許可したか確認（設定アプリ→アプリ→Termux→権限からも確認可能） |

---

## 10. （参考）api-checker との連携

本リポジトリの `api-checker/index.html`（Gemini等のAPIキー確認ツール）は、Node.jsが動くTermux環境があれば、ローカルサーバーとして配信して動作確認することもできます。

```sh
cd ~/storage/shared/Documents/api-checker   # index.htmlを置いたフォルダに移動
npx --yes serve .
```

表示されたURL（例: `http://localhost:3000`）をスマホのブラウザで開くと、`file://`で開いた場合よりも安定して動作確認ができます（必須の手順ではありません）。
