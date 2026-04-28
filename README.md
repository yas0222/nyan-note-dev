# にゃん・ノート（ローカルプロトタイプ）

このリポジトリは、既存デザイン（見た目・配色・タブ構成）を維持したまま、実用的な機能を追加した React ベースのローカルプロトタイプです。

## 変更しないUI要素（維持方針）

- アプリ名「にゃん・ノート」
- ヘッダー、紙風背景、カード・タブの基本デザイン
- トップ画面（ホーム）の世界観・レイアウト
- 統計画面の見た目
- 下部ナビゲーションの構成（ホーム / わが家 / 記録 / みんな / 統計）
- 既存の配色・余白・フォントトーン

> 追加機能のためのボタンやフォームは、既存カードUI内に最小限で追加しています。

## 追加した機能

1. 猫プロフィールの追加
2. 猫プロフィールの編集
3. 猫プロフィールの削除（関連記録も削除）
4. 日次記録の追加
5. 日次記録の編集
6. 日次記録の削除
7. 今日の記録済み / 未記録の判定（ホーム表示）
8. `localStorage` への保存
9. 入力バリデーション（猫プロフィール / 日次記録）
10. サンプルデータの初期表示
11. サンプルデータのみ削除
12. 全データのリセット（初期状態へ）
13. 体重記録の追加（猫プロフィール / 日次記録 / 履歴 / 7日推移）
14. 毛色・柄の追加（猫プロフィール入力 / わが家表示 / ホーム表示）
15. わが家画面で登録済みの猫を全件カード表示（最新の日次記録の要約つき）
16. カリカリ / ウェット比率の選択肢を 5択（100:0 / 75:25 / 50:50 / 25:75 / 0:100）に整理
17. 飲水量の増減ボタンを 5ml 単位に変更（直接入力は継続）
18. 猫プロフィール画像のアップロード追加（設定済み表示・小プレビューつき）
19. 猫プロフィール画像の削除機能を追加（削除時はデフォルト猫アイコンに戻る）
20. アップロード画像は縮小・圧縮した上で `localStorage` に保存（端末ごとのローカル保存）
21. 「写真（絵文字）」入力を廃止（旧データに絵文字が残っていても互換維持）
22. ホーム下部の開発向け機能を「開発用メニュー」に集約（初期は折りたたみ）
23. 開発用メニューから `localStorage` データを JSON 形式で書き出せるバックアップ機能を追加

## データ仕様（概要）

- 保存キー: `nyan-note-prototype-v1`
- 保存内容:
  - `cats`: 猫プロフィール配列
  - `logsByCat`: 猫IDごとの日次記録配列
  - `nextIds`: 採番管理
- `cats` の地域情報は `prefecture` / `city` / `region` / `publicRegionLevel` で管理
  - `publicRegionLevel`: `none` / `prefecture` / `city`
- サンプルデータには `source: "sample"` を付与
- ユーザーデータには `source: "user"` を付与

### 開発用メニューのデータ書き出し（バックアップ）

- ホーム画面の「開発用メニュー」を開くと、`データを書き出す` ボタンを利用できます。
- 書き出し対象は、アプリが現在利用している `localStorage` のにゃん・ノートデータです。
- ダウンロードファイル名は `nyan-note-backup-YYYY-MM-DD.json` 形式です。
- JSON には次の情報が含まれます。
  - `appName`（`にゃん・ノート`）
  - `backupFormatVersion`（`v1`）
  - `exportedAt`（書き出し日時）
  - `cats`
  - `logsByCat`
  - `nextIds`

## 入力バリデーション

### 猫プロフィール

- 名前: 必須
- 年齢: 0〜30 の整数
- 性別: ♂ / ♀
- 都道府県: 必須（47都道府県の選択式）
- 市区町村（任意）: 任意のテキスト入力
- 地域の公開範囲: `非公開 (none)` / `都道府県まで (prefecture)` / `市区町村まで (city)`（初期値: 都道府県まで）
- 地域表示・保存: `region = 都道府県 + 市区町村`（市区町村が空の場合は都道府県のみ）
- 毛色・柄: 任意のテキスト入力（例: 茶白、キジトラ、三毛、黒猫、白黒ハチワレ）
- 現在の体重: 任意、0より大きく30未満、小数1桁まで

### 地域データの扱い（将来の統計向け）

- 猫プロフィールの地域は `prefecture`（都道府県）と `city`（市区町村・任意）で管理します。
- 画面表示用に `region`（`都道府県 + 市区町村`）を保存し、市区町村が空なら都道府県のみ表示します。
- 公開レベルは `publicRegionLevel`（`none` / `prefecture` / `city`）で保持し、将来の「みんな」機能や地域別統計で利用する想定です。

### 日次記録

- 日付: 必須（YYYY-MM-DD）
- ごはん量: 0〜150g
- カリカリ比率 / ウェット比率: 5択（100:0 / 75:25 / 50:50 / 25:75 / 0:100）を基本に選択、既存データ互換のため各 0〜100 合計100 の値も読込可能
- 飲水量: 0〜500ml（ボタン操作は5ml単位、直接入力可）
- うんち / おしっこ回数: 0〜20回
- 今日の体重: 任意、0より大きく30未満、小数1桁まで
- 同一猫・同一日付の重複保存を防止

### 猫プロフィール画像アップロード

- 猫プロフィール編集フォームで端末内の画像を選択できます（スマホ含む）。
- 画像を設定した場合は、猫カードの丸いアイコン領域に画像を表示します。
- 画像が設定済みのときは、フォーム上に「画像を設定済み」と現在画像の小プレビュー、および「画像を削除」ボタンが表示されます。
- 画像が未設定のときは、フォーム上に「画像未設定」と表示し、画面上はデフォルト猫アイコンを表示します。
- 「写真（絵文字）」入力は廃止しました（既存 `localStorage` に絵文字データが残っていても表示・保存は継続可能）。
- 画像の保存先は `localStorage` です（クラウド同期なし / 端末ごとのローカル保存）。

## ローカル実行

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## 補足

- 実装は `app.js`（単一ファイル）をベースに、既存 UI を壊さない差分拡張で対応しています。
- `styles.css` は既存のまま維持しています（本UIは主に `app.js` のインラインスタイルで構成）。

## Firebase 対応の土台（今回追加）

- Firestore 保存の土台を追加しました。猫プロフィール（`cats`）と日次記録（`records`）を Firestore に保存できる構造です。
- 将来の「みんな」機能に向けて、公開プロフィールは `publicCats` コレクションに分離して保存する方針です。`cats` / `records` は本人用データとして扱い、公開してよい最小限の項目のみ `publicCats` に保存します。
- 「みんな」画面は `publicCats` コレクションのみを匿名ログイン後に読み込み、公開プロフィール一覧を表示します。`cats` / `records` コレクションの読み込みや公開は行いません。
- 「みんな」画面には都道府県フィルター（`すべて` + 47都道府県）を用意し、`publicCats.prefecture` で絞り込みできます（`すべて` は `updatedAt` 降順で最大50件、都道府県指定は `where("prefecture", "==", 都道府県).orderBy("updatedAt", "desc").limit(50)`）。
- ただし `localStorage` 保存を常に優先し、Firestore 保存に失敗してもアプリが壊れない実装にしています。
- Firebase 未設定時は自動でローカル運用（`localStorage` のみ）になります。
- Firebase Authentication の匿名ログインを実装しています。アプリ起動時に匿名ログインを試行し、成功時は `auth.currentUser.uid` を `ownerUid` として利用します。
- Firebase Auth が利用できない、または匿名ログインに失敗した場合は、既存の `localStorage` の `anonymousOwnerId` をフォールバックとして継続利用します（既存データは削除しません）。
- 将来的には Google ログイン / Apple ログインへ拡張する予定です（現在は匿名認証のみ）。
- 猫プロフィール画像は現時点でも `localStorage` のみに保存し、Firestore（`cats` / `records`）には保存しません。Firestoreには `hasLocalImage` のような軽量フラグのみを保存します。
- 設定カード内に「Firebase診断」を追加し、以下を画面で確認できます。
  - Firebase config 設定有無
  - Firebase app 初期化成功 / 失敗
  - Firestore 初期化成功 / 失敗
  - 認証状態（未認証 / 匿名ログイン中 / 匿名ログイン済み / 認証エラー）
  - Firebase Auth uid / localStorage fallback ownerId / 現在保存に使っている ownerUid / ownerUid の種類（Firebase Auth または localStorage fallback）
  - 最後の猫プロフィール保存結果
  - 最後の公開プロフィール保存結果
  - 最後の公開プロフィール読み込み条件（すべて / 選択中の都道府県）
  - 最後に猫プロフィール保存で使った ownerUid
  - 最後の日次記録保存結果
  - 最後に日次記録保存で使った ownerUid
  - 最後の Firebase エラーコード / メッセージ
  - Firestore 接続テスト結果
- ホーム画面下部では、開発向け項目は初期状態で「開発用メニュー ▼」として折りたたまれています。必要なときだけタップして展開し、「データ管理」や「Firebase診断」を確認できます。

### Firebase診断の使い方

1. ホーム画面の下部「Firebase診断」カードを開きます。
2. ownerUid 関連の確認では、`Firebase Auth uid` が取得できている場合に `現在保存に使っている ownerUid` が同じ値になることを確認してください（匿名認証 uid を常に優先利用）。
3. Firebase Auth が使えない場合のみ、`ownerUidの種類` が `localStorage fallback` になり、既存の fallback ownerId が利用されます。
4. Firestore セキュリティルール設定前に、猫プロフィール保存 / 日次記録保存を実行し、`最後に〜保存で使った ownerUid` が期待通りか必ず確認してください。
5. `Firestore接続テスト` ボタンを押すと、Firestore の `debug` コレクションへテストドキュメントを書き込みます（`Firebase app 初期化成功` と `Firestore 初期化成功` の表示を先に確認）。
6. 保存内容は軽量データのみです。
   - `ownerUid`
   - `createdAt`
   - `message: "firestore test"`
7. 成功時は画面に `Firestore接続テスト成功` と表示され、失敗時はエラーコードとエラーメッセージが表示されます。
8. 同時に `console.log` / `console.error` に詳細を出力するため、ブラウザ開発者ツールでも原因追跡できます。

### GitHub Pages での Firebase SDK 読み込み構成

- 本アプリは GitHub Pages で動く静的 HTML 構成です（npm / bundler 不要）。
- Firebase は **compat SDK** を `index.html` の `script` タグで読み込みます。
- 読み込み順は次の通りです（`app.js` より前に Firebase SDK を置く）:

```html
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="app.js"></script>
```

- `app.js` 側では compat API（`firebase.initializeApp` / `firebase.firestore`）に統一し、modular API とは混在させません。

### Firebase プロジェクト作成手順（概要）

1. Firebase コンソールで新規プロジェクトを作成。
2. Web アプリを追加し、Firebase SDK 設定値（apiKey など）を取得。
3. Firestore Database を作成（本アプリは Firestore を利用）。
4. 必要に応じてルールを設定（開発時は読み書き可能な最低限の設定で確認）。

### Firebase config の設定場所

- `app.js` 内の `FIREBASE_CONFIG` に設定値をまとめています。
- ここが未設定（空文字）の場合は「Firebase未設定」として動作し、ローカル保存のみ行います。

### 現時点の制約と今後の方針

- 現時点の認証方式は Firebase Authentication の匿名認証です。
- 将来的には Google ログイン / Apple ログインへ拡張する予定です。
- 画像は Firebase Storage へは移行していません（引き続き localStorage 保存）。
- 将来リリースに向け、以下の対応が必要です。
  - Google / Apple ログイン導入（匿名認証からの拡張）
  - Firebase Storage への画像保存移行
  - PWA 化
  - Capacitor による Android / iOS アプリ化
  - プライバシーポリシー整備
  - アカウント削除機能
