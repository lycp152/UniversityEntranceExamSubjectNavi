# セキュリティポリシー

## サポートされているバージョン

現在セキュリティアップデートがサポートされているバージョン：

| バージョン | サポート状況 | サポート期限 | 備考   |
| ---------- | ------------ | ------------ | ------ |
| 0.1.x      | ✅           | 無期限       | 開発版 |

## 脆弱性の報告

セキュリティの脆弱性を発見した場合は、以下の手順で報告してください：

1. **非公開での報告（推奨）**:

   - GitHub の Private vulnerability reporting 機能を使用
   - セキュリティチームが非公開で対応
   - 報告者とセキュリティチームの安全なコミュニケーション

2. **緊急性の高い脆弱性**:

   - 直接セキュリティチームにメール（security@your-domain.com）で連絡
   - 件名に「[緊急] セキュリティ脆弱性の報告」と記載
   - PGP 鍵: [PGP 公開鍵のリンク]

3. **一般的な脆弱性**:

   - GitHub のセキュリティタブから報告
   - 「Security Advisory」を作成

4. **教育データに関する脆弱性**:

   - 個人情報保護責任者に直接連絡（privacy@your-domain.com）
   - データ漏洩の可能性がある場合は即時報告

5. **報告に含めるべき情報**:
   - 脆弱性の詳細な説明
   - 再現手順
   - 影響を受ける利用者の範囲
   - 教育データへの潜在的影響
   - 可能であれば修正案

## セキュリティ対策

本プロジェクトで実施しているセキュリティ対策：

1. **教育データの保護**:

   - 入試データの暗号化（AES-256）
   - アクセスログの保存（2 年間）
   - 定期的なデータバックアップ（日次）
   - データの地理的冗長化

2. **認証・認可**:

   - JWT 認証（有効期限 24 時間）
   - リフレッシュトークン（有効期限 30 日）
   - CSRF トークンの使用
   - 適切な CORS ポリシー設定
   - 多要素認証（管理者アカウント必須）

3. **システムセキュリティ**:

   - 依存パッケージの週次更新
   - GitHub Dependabot による自動アラート
   - 四半期ごとのペネトレーションテスト
   - WAF の導入

4. **コンプライアンス**:
   - GDPR 対応
   - 個人情報保護法対応
   - 教育機関向けセキュリティガイドライン準拠

## インシデント対応

セキュリティインシデントが発生した場合の対応手順：

1. 即時対応（発見から 24 時間以内）:

   - 影響範囲の特定
   - システムの一時停止判断
   - 教育機関への一次報告
   - 関係者への通知

2. 調査（48 時間以内）:

   - インシデントの原因究明
   - 影響を受けたデータの特定
   - アクセスログの分析
   - フォレンジック調査の開始

3. 修正（72 時間以内）:

   - セキュリティパッチの適用
   - システムの再構築
   - 予防措置の実施
   - 教育データの整合性確認

4. 報告（修正完了から 24 時間以内）:
   - 影響を受けた利用者への通知
   - 関連機関への最終報告
   - 再発防止策の公表

## 定期的なセキュリティレビュー

1. **月次レビュー**:

   - 依存パッケージの脆弱性チェック
   - アクセスログの分析
   - インシデントレポートの確認

2. **四半期レビュー**:

   - ペネトレーションテストの実施
   - セキュリティ設定の見直し
   - 従業員のセキュリティトレーニング

3. **年次レビュー**:
   - セキュリティポリシーの見直し
   - リスクアセスメントの実施
   - 災害復旧計画の更新

## 更新履歴

- 2024-02-15: 教育データ保護に関する項目を追加
- 2024-02-01: インシデント対応手順の追加、バージョン管理ポリシーの明確化
- 2024-01-01: セキュリティポリシーの初版作成
