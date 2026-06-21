#!/usr/bin/env node
"use strict";

/*
 * Termux上でNode.jsが正常に動作するかを確認するスクリプト。
 * 使い方: termux-node-checker/MANUAL.md を参照。
 *
 * 確認項目:
 *   1. Node.js / npm のバージョン
 *   2. ローカルファイルの読み書き
 *   3. ネットワーク通信（HTTPS）
 *   4. 内部ストレージのDocumentsフォルダへの書き込み
 *      （termux-setup-storage 実行済みであれば自動検出して保存する）
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    "_" +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  );
}

function checkVersions() {
  const nodeVersion = process.version;
  let npmVersion = "(取得失敗)";
  try {
    npmVersion = execSync("npm -v").toString().trim();
  } catch (e) {
    // npmが見つからない場合はそのまま「取得失敗」を返す
  }
  return { nodeVersion, npmVersion, platform: process.platform, arch: process.arch };
}

function checkLocalFileIO() {
  try {
    const tmp = path.join(os.tmpdir(), "node_check_" + Date.now() + ".tmp");
    fs.writeFileSync(tmp, "ok");
    const read = fs.readFileSync(tmp, "utf8");
    fs.unlinkSync(tmp);
    return read === "ok";
  } catch (e) {
    return false;
  }
}

function checkNetwork() {
  return new Promise((resolve) => {
    const req = https.get("https://www.google.com/generate_204", (res) => {
      resolve({ ok: true, status: res.statusCode });
      res.resume();
    });
    req.on("error", (e) => resolve({ ok: false, error: String(e) }));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ ok: false, error: "timeout" });
    });
  });
}

function findDocumentsDir() {
  const candidates = [
    path.join(os.homedir(), "storage", "shared", "Documents"),
    "/storage/emulated/0/Documents",
  ];
  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        return dir;
      }
    } catch (e) {
      // アクセスできない場合は次の候補を試す
    }
  }
  return null;
}

async function main() {
  console.log("=== Termux Node.js 動作確認 ===");

  const versions = checkVersions();
  console.log("Node.js: " + versions.nodeVersion);
  console.log("npm: " + versions.npmVersion);
  console.log("platform: " + versions.platform + " / " + versions.arch);

  const fileIOok = checkLocalFileIO();
  console.log("ローカルファイルI/O: " + (fileIOok ? "OK" : "NG"));

  console.log("ネットワーク接続を確認中...");
  const net = await checkNetwork();
  console.log("ネットワーク接続: " + (net.ok ? "OK (HTTP " + net.status + ")" : "NG (" + net.error + ")"));

  const docDir = findDocumentsDir();

  const lines = [];
  lines.push("Termux Node.js 動作確認結果");
  lines.push("作成日時: " + new Date().toLocaleString("ja-JP"));
  lines.push("----------------------------------------");
  lines.push("Node.jsバージョン: " + versions.nodeVersion);
  lines.push("npmバージョン: " + versions.npmVersion);
  lines.push("OS/アーキテクチャ: " + versions.platform + " / " + versions.arch);
  lines.push("ローカルファイルI/O: " + (fileIOok ? "OK" : "NG"));
  lines.push("ネットワーク接続: " + (net.ok ? "OK (HTTP " + net.status + ")" : "NG (" + net.error + ")"));
  lines.push("");

  const content = lines.join("\n");
  const fname = "check_node_" + nowStamp() + ".txt";

  if (docDir) {
    const fullPath = path.join(docDir, fname);
    fs.writeFileSync(fullPath, content + "保存先フォルダ: " + fullPath + "\n", "utf8");
    console.log("");
    console.log("チェックファイルを保存しました: " + fullPath);
  } else {
    const fallback = path.join(process.cwd(), fname);
    fs.writeFileSync(fallback, content + "保存先フォルダ: 見つからなかったためカレントディレクトリに保存\n", "utf8");
    console.log("");
    console.log("内部ストレージのDocumentsフォルダが見つからなかったため、カレントディレクトリに保存しました:");
    console.log(fallback);
    console.log("`termux-setup-storage` を実行してストレージ権限を許可してから再実行してください。");
  }

  const allOk = fileIOok && net.ok;
  console.log("");
  console.log(allOk ? "総合結果: OK - Node.jsはTermuxで正常に動作しています" : "総合結果: 一部NGの項目があります。上記ログを確認してください");
  process.exit(allOk ? 0 : 1);
}

main();
