# にゃん・ノート（プロトタイプ）

このリポジトリは、Reactベースの猫健康記録UIプロトタイプです。

## 技術構成

- React 18（CDN / import map）
- lucide-react（アイコン）
- Babel Standalone（ブラウザ上でJSXを変換）

## ローカル実行

```bash
python3 -m http.server 8000
```

その後、`http://localhost:8000` を開いてください。

## 備考

- `app.js` に単一ファイルのReactコンポーネント実装を置いています。
- データはモックデータで、永続化は未実装です。
