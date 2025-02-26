# パフォーマンスチューニングガイド

## 概要

本プロジェクトのパフォーマンス最適化について説明します。

## フロントエンド最適化

### 1. ビルド最適化

1. コード分割

   ```typescript
   // 動的インポート
   const DynamicComponent = dynamic(() => import("../components/Heavy"));
   ```

2. バンドルサイズの最適化

   ```bash
   # バンドルサイズの分析
   npm run analyze

   # 未使用コードの削除
   npm run purge
   ```

### 2. レンダリング最適化

1. メモ化

   ```typescript
   const MemoizedComponent = React.memo(({ data }) => {
     // 重い処理
     return <div>{/* レンダリング */}</div>;
   });
   ```

2. 仮想化

   ```typescript
   import { VirtualList } from "react-window";

   const List = ({ items }) => (
     <VirtualList height={400} itemCount={items.length} itemSize={50}>
       {({ index, style }) => <div style={style}>{items[index]}</div>}
     </VirtualList>
   );
   ```

### 3. 画像最適化

1. 画像の遅延読み込み

   ```typescript
   <Image src="/large-image.jpg" loading="lazy" width={800} height={600} />
   ```

2. WebP フォーマットの使用
   ```typescript
   <picture>
     <source srcSet="/image.webp" type="image/webp" />
     <img src="/image.jpg" alt="画像" />
   </picture>
   ```

## バックエンド最適化

### 1. データベース最適化

1. インデックス設定

   ```sql
   -- 頻繁に検索される列にインデックスを作成
   CREATE INDEX idx_universities_name ON universities(name);
   ```

2. クエリ最適化
   ```go
   // N+1問題の解決
   db.Preload("Departments").Find(&universities)
   ```

### 2. キャッシュ戦略

1. Redis キャッシュ

   ```go
   func GetUniversity(id string) (*University, error) {
       // キャッシュから取得
       if cached, err := redis.Get(id); err == nil {
           return cached, nil
       }

       // DBから取得してキャッシュ
       university := &University{}
       if err := db.Find(university, id); err != nil {
           return nil, err
       }
       redis.Set(id, university, time.Hour)
       return university, nil
   }
   ```

2. インメモリキャッシュ

   ```go
   var cache = ccache.New(ccache.Configure())

   func GetConfig() Config {
       if item := cache.Get("config"); item != nil {
           return item.Value().(Config)
       }
       // 設定を読み込んでキャッシュ
   }
   ```

### 3. 並行処理

1. ゴルーチンの活用

   ```go
   func ProcessItems(items []Item) {
       var wg sync.WaitGroup
       for _, item := range items {
           wg.Add(1)
           go func(i Item) {
               defer wg.Done()
               process(i)
           }(item)
       }
       wg.Wait()
   }
   ```

2. ワーカープール
   ```go
   func StartWorkerPool(jobs <-chan Job, results chan<- Result) {
       for i := 0; i < runtime.NumCPU(); i++ {
           go worker(jobs, results)
       }
   }
   ```

## インフラストラクチャ最適化

### 1. コンテナ最適化

1. マルチステージビルド

   ```dockerfile
   # ビルドステージ
   FROM golang:1.21 AS builder
   WORKDIR /app
   COPY . .
   RUN go build -o main

   # 実行ステージ
   FROM alpine:latest
   COPY --from=builder /app/main /main
   CMD ["/main"]
   ```

2. リソース制限
   ```yaml
   resources:
     limits:
       cpu: "1"
       memory: "512Mi"
     requests:
       cpu: "0.5"
       memory: "256Mi"
   ```

### 2. ネットワーク最適化

1. CDN の活用

   ```typescript
   // next.config.js
   module.exports = {
     images: {
       domains: ["cdn.example.com"],
     },
   };
   ```

2. HTTP/2 の有効化
   ```go
   server := &http.Server{
       Addr:    ":443",
       Handler: router,
       TLSConfig: &tls.Config{
           NextProtos: []string{"h2", "http/1.1"},
       },
   }
   ```

## パフォーマンスモニタリング

### 1. メトリクス収集

1. アプリケーションメトリクス

   ```go
   // Prometheusメトリクス
   var (
       requestDuration = prometheus.NewHistogramVec(
           prometheus.HistogramOpts{
               Name: "http_request_duration_seconds",
               Help: "HTTP request duration in seconds",
           },
           []string{"handler", "method"},
       )
   )
   ```

2. システムメトリクス
   - CPU 使用率
   - メモリ使用量
   - ディスク I/O
   - ネットワークトラフィック

### 2. パフォーマンステスト

1. 負荷テスト

   ```bash
   # k6を使用した負荷テスト
   k6 run load-test.js
   ```

2. プロファイリング

   ```go
   import _ "net/http/pprof"

   // プロファイリングエンドポイントの有効化
   go func() {
       log.Println(http.ListenAndServe(":6060", nil))
   }()
   ```

## パフォーマンスチェックリスト

- [ ] フロントエンドのバンドルサイズ最適化
- [ ] 画像の最適化と遅延読み込み
- [ ] データベースインデックスの見直し
- [ ] キャッシュ戦略の実装
- [ ] 並行処理の適用
- [ ] コンテナリソースの最適化
- [ ] CDN の設定
- [ ] メトリクス監視の設定

## ベンチマーク

### 1. 目標値

- ページ読み込み時間: < 2 秒
- Time to First Byte: < 200ms
- メモリ使用量: < 512MB
- CPU 使用率: < 70%

### 2. 測定ツール

- Lighthouse
- Apache JMeter
- Prometheus + Grafana
- pprof

## 参考文献

- [Web Vitals](https://web.dev/vitals/)
- [Go Performance](https://golang.org/doc/diagnostics)
- [React Performance](https://reactjs.org/docs/optimizing-performance.html)
