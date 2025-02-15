package logger

import (
	"log"
	"os"
	"time"

	"github.com/labstack/echo/v4"
)

var (
	infoLogger  *log.Logger
	errorLogger *log.Logger
	accessLogger *log.Logger
)

// InitLoggers はロガーを初期化します
func InitLoggers() {
	// ログファイルのディレクトリを作成
	if err := os.MkdirAll("logs", 0755); err != nil {
		log.Fatal("Failed to create logs directory:", err)
	}

	// 情報ログの設定
	infoFile, err := os.OpenFile("logs/info.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open info log file:", err)
	}
	infoLogger = log.New(infoFile, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)

	// エラーログの設定
	errorFile, err := os.OpenFile("logs/error.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open error log file:", err)
	}
	errorLogger = log.New(errorFile, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)

	// アクセスログの設定
	accessFile, err := os.OpenFile("logs/access.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open access log file:", err)
	}
	accessLogger = log.New(accessFile, "ACCESS: ", log.Ldate|log.Ltime)
}

// Info は情報ログを記録します
func Info(format string, v ...interface{}) {
	infoLogger.Printf(format, v...)
}

// Error はエラーログを記録します
func Error(format string, v ...interface{}) {
	errorLogger.Printf(format, v...)
}

// AccessLogMiddleware はHTTPリクエストのアクセスログを記録するミドルウェアです
func AccessLogMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			start := time.Now()

			err := next(c)
			if err != nil {
				c.Error(err)
			}

			req := c.Request()
			res := c.Response()

			accessLogger.Printf("%s %s %s %d %s %v",
				req.Method,
				req.RequestURI,
				req.RemoteAddr,
				res.Status,
				req.UserAgent(),
				time.Since(start),
			)

			return err
		}
	}
}
