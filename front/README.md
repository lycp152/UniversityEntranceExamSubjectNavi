このプロジェクトは[Next.js](https://nextjs.org)を使用して[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)で作成されました。

## はじめに

まず、開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開いて結果を確認してください。

`app/page.tsx`を編集することでページを変更できます。ファイルを編集すると、ページは自動的に更新されます。

## 環境変数の設定

環境変数は環境ごとに以下のファイルで設定します：

- 開発環境: `deployments/docker/development/.env.development`
- ステージング環境: `deployments/docker/staging/.env.staging`
- 本番環境: `deployments/docker/production/.env.production`

開発環境の例：

```bash
# deployments/docker/development/.env.development
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_ENV=development
```

ステージング環境の例：

```bash
# deployments/docker/staging/.env.staging
NEXT_PUBLIC_API_URL=https://staging-api.example.com
NEXT_PUBLIC_APP_ENV=staging
```

環境変数の詳細については、[Next.js 環境変数](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)を参照してください。

## セキュリティ設定

このプロジェクトでは以下のセキュリティ対策を実装しています：

- Content Security Policy (CSP) の設定
- XSS対策
- CSRF対策
- セキュアなヘッダーの設定

詳細については、[Next.js セキュリティ](https://nextjs.org/docs/advanced-features/security-headers)を参照してください。

## パフォーマンス最適化

このプロジェクトでは以下のパフォーマンス最適化を実装しています：

- 画像の最適化
- フォントの最適化
- コード分割
- キャッシュ戦略

詳細については、[Next.js パフォーマンス](https://nextjs.org/docs/app/building-your-application/optimizing/performance)を参照してください。

## 詳細情報

Next.jsについて詳しく知りたい場合は、以下のリソースを参照してください：

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.jsの機能とAPIについて学びます。
- [Next.js チュートリアル](https://nextjs.org/learn) - インタラクティブなNext.jsチュートリアルです。

[Next.js GitHubリポジトリ](https://github.com/vercel/next.js)も確認できます - フィードバックと貢献をお待ちしています！

## Vercelへのデプロイ

Next.jsアプリをデプロイする最も簡単な方法は、Next.jsの開発元である[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細については、[Next.jsデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)を参照してください。
