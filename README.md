# 家計簿・メモアプリ（Termux / Node.js 専用ローカルWebアプリ）

Android の Termux 上の Node.js で動く、自分専用のローカルWebアプリです。
ブラウザから `http://localhost:3000` にアクセスして使います。外部サーバーやアプリストアは不要、端末内で完結します。

## 特徴

- 依存パッケージは **ゼロ**。Node標準の `http` モジュールのみでサーバーを実装しているため、Termuxでのネイティブビルド失敗の心配がありません。
- データは SQLite ではなく `data/budget.json` / `data/memos.json` という **JSONファイル** に保存します。サーバーを再起動してもデータは残ります。
- フロントエンドは `public/index.html` 1枚。ビルド工程はなく、HTML+CSS+JSのみです。

## ファイル構成

```
agit/
├── server.js          # サーバー本体（Node標準httpモジュールのみ）
├── package.json
├── README.md
├── public/
│   └── index.html     # フロントエンド（家計簿／メモ タブ切り替えUI）
└── data/               # 初回起動時に自動生成されます
    ├── budget.json
    └── memos.json
```

## 必要なパッケージ

**なし。** `npm install` は不要です（Node標準モジュールのみで動作します）。

## 起動方法

Termuxで以下を実行します。

```sh
# このリポジトリのディレクトリに移動してから
node server.js
```

起動すると以下のように表示されます。

```
家計簿・メモアプリ起動: http://localhost:3000
```

Termux内のブラウザ（Chromeなど）で `http://localhost:3000` を開いてください。

別のポートで起動したい場合は環境変数 `PORT` を指定します。

```sh
PORT=8080 node server.js
```

## 使い方

- 画面上部の「家計簿」「メモ」タブで表示を切り替えます。
- **家計簿タブ**: 日付・カテゴリ・金額・メモを入力して収入／支出を登録します。一覧は新しい順に表示され、合計収入・合計支出・残高が表示されます。各項目は削除できます。
- **メモタブ**: タイトルと本文を入力してメモを追加します。一覧から編集・削除ができます。

## データの保存場所

`data/budget.json` と `data/memos.json` に保存されます。このフォルダ・ファイルを残したままサーバーを再起動すれば、データは消えません。バックアップしたい場合はこの2つのファイルをコピーしてください。

## API一覧

| メソッド | パス | 内容 |
|---|---|---|
| GET | /api/budget | 家計簿の一覧取得 |
| POST | /api/budget | 家計簿の新規登録 |
| DELETE | /api/budget/:id | 家計簿の項目削除 |
| GET | /api/memos | メモの一覧取得 |
| POST | /api/memos | メモの新規追加 |
| PUT | /api/memos/:id | メモの編集 |
| DELETE | /api/memos/:id | メモの削除 |
