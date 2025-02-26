# API 仕様書

## 概要

UniversityEntranceExamSubjectNavi の REST API の仕様書です。

## 基本情報

- ベース URL: `http://localhost:8080/api/v1`
- 認証: Bearer Token
- レスポンス形式: JSON

## 認証

すべての API リクエストには認証が必要です。認証トークンは以下のように`Authorization`ヘッダーに設定してください：

```
Authorization: Bearer <your-token>
```

## エンドポイント一覧

### 大学関連

#### 大学一覧の取得

- エンドポイント: `GET /universities`
- 詳細: [大学一覧 API](./endpoints/universities/list.md)

#### 大学詳細の取得

- エンドポイント: `GET /universities/{id}`
- 詳細: [大学詳細 API](./endpoints/universities/get.md)

#### 大学情報の更新

- エンドポイント: `PUT /universities/{id}`
- 詳細: [大学更新 API](./endpoints/universities/update.md)

### 学部関連

#### 学部一覧の取得

- エンドポイント: `GET /universities/{universityId}/departments`
- 詳細: [学部一覧 API](./endpoints/departments/list.md)

#### 学部詳細の取得

- エンドポイント: `GET /departments/{id}`
- 詳細: [学部詳細 API](./endpoints/departments/get.md)

## 共通レスポンス形式

### 成功時

```json
{
  "status": "success",
  "data": {
    // レスポンスデータ
  }
}
```

### エラー時

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {
      // 追加のエラー情報
    }
  }
}
```

## エラーコード

| コード            | 説明                       | HTTP ステータス |
| ----------------- | -------------------------- | --------------- |
| `INVALID_REQUEST` | リクエストパラメータが不正 | 400             |
| `UNAUTHORIZED`    | 認証エラー                 | 401             |
| `FORBIDDEN`       | 権限エラー                 | 403             |
| `NOT_FOUND`       | リソースが見つからない     | 404             |
| `INTERNAL_ERROR`  | サーバー内部エラー         | 500             |

## レート制限

- リクエスト制限: 60 回/分
- 超過時のレスポンス: 429 Too Many Requests

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト制限を超過しました",
    "details": {
      "retryAfter": 60
    }
  }
}
```

## バージョニング

API のバージョンは URL パスで管理します：

- 現在のバージョン: `v1`
- 非推奨バージョン: なし
- 今後のバージョン: `v2`（開発中）

## 詳細仕様

- [認証・認可](./auth.md)
- [データモデル](./models.md)
- [エラーハンドリング](./errors.md)
- [ページネーション](./pagination.md)
- [フィルタリング](./filtering.md)
- [ソート](./sorting.md)

## 変更履歴

- 2024-02-24: 初版作成
- 2024-02-23: ドラフト作成
