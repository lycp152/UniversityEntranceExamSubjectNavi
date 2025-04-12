package configs

import (
	"fmt"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"gopkg.in/yaml.v3"
)

const configFile = "app.yaml"
const errMsgReadConfig = "設定ファイルの読み込みに失敗しました: %v"
const errMsgParseConfig = "設定の解析に失敗しました: %v"

// 環境変数の展開を行う関数
func expandEnvVars(value string) string {
	if strings.HasPrefix(value, "${") {
		return expandDefaultEnvVar(value)
	}

	if strings.HasPrefix(value, "$") {
		return expandSimpleEnvVar(value)
	}

	return value
}

// ${VAR:-default} 形式の環境変数を展開
func expandDefaultEnvVar(value string) string {
	if !strings.Contains(value, ":-") {
		return expandSimpleEnvVar(value)
	}

	parts := strings.SplitN(value[2:len(value)-1], ":-", 2)
	if len(parts) != 2 {
		return value
	}

	if envValue := os.Getenv(parts[0]); envValue != "" {
		return envValue
	}

	return parts[1]
}

// $VAR 形式の環境変数を展開
func expandSimpleEnvVar(value string) string {
	if strings.HasPrefix(value, "${") {
		varName := value[2 : len(value)-1]
		if envValue := os.Getenv(varName); envValue != "" {
			return envValue
		}
	} else if strings.HasPrefix(value, "$") {
		if envValue := os.Getenv(value[1:]); envValue != "" {
			return envValue
		}
	}

	return value
}

// 環境変数の管理
func manageEnvVars(envVars map[string]string) (func(), map[string]string) {
	envBackup := backupEnvVars(envVars)
	setEnvVars(envVars)

	return func() { restoreEnvVars(envBackup) }, envBackup
}

func backupEnvVars(envVars map[string]string) map[string]string {
	envBackup := make(map[string]string)

	for k := range envVars {
		if v, ok := os.LookupEnv(k); ok {
			envBackup[k] = v
		}
	}

	return envBackup
}

func setEnvVars(envVars map[string]string) {
	for k, v := range envVars {
		if err := os.Setenv(k, v); err != nil {
			panic(fmt.Sprintf("環境変数の設定に失敗しました: %v", err))
		}
	}
}

func restoreEnvVars(envBackup map[string]string) {
	for k, v := range envBackup {
		if err := os.Setenv(k, v); err != nil {
			panic(fmt.Sprintf("環境変数の復元に失敗しました: %v", err))
		}
	}
}

// 設定の検証
func validateConfig(t *testing.T, config map[string]interface{}) {
	validateServerConfig(t, config)
	validateDBConfig(t, config)
	validateSecurityConfig(t, config)
}

func validateServerConfig(t *testing.T, config map[string]interface{}) {
	if server, ok := config["server"].(map[string]interface{}); ok {
		assert.Equal(t, expandEnvVars("${PORT:-8080}"), expandEnvVars(server["port"].(string)))
		assert.Equal(t, expandEnvVars("${NODE_ENV:-development}"), expandEnvVars(server["environment"].(string)))
	}
}

func validateDBConfig(t *testing.T, config map[string]interface{}) {
	if db, ok := config["database"].(map[string]interface{}); ok {
		assert.Equal(t, expandEnvVars("${DB_HOST:-postgres}"), expandEnvVars(db["host"].(string)))
		assert.Equal(t, expandEnvVars("${DB_PORT:-5432}"), expandEnvVars(db["port"].(string)))
	}
}

func validateSecurityConfig(t *testing.T, config map[string]interface{}) {
	if security, ok := config["security"].(map[string]interface{}); ok {
		if jwt, ok := security["jwt"].(map[string]interface{}); ok {
			assert.Equal(t, expandEnvVars("${JWT_SECRET}"), expandEnvVars(jwt["secret"].(string)))
		}
	}
}

func TestAppConfig(t *testing.T) {
	configData, err := os.ReadFile(configFile)

	if err != nil {
		t.Fatalf(errMsgReadConfig, err)
	}

	tests := []struct {
		name    string
		envVars map[string]string
	}{
		{
			name: "デフォルト設定の検証",
			envVars: map[string]string{
				"PORT":     "8080",
				"NODE_ENV": "development",
			},
		},
		{
			name: "データベース設定の検証",
			envVars: map[string]string{
				"DB_HOST": "test-db",
				"DB_PORT": "5432",
			},
		},
		{
			name: "セキュリティ設定の検証",
			envVars: map[string]string{
				"JWT_SECRET": "test-secret",
			},
		},
		{
			name:    "デフォルト値の検証",
			envVars: map[string]string{},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cleanup, _ := manageEnvVars(tt.envVars)
			defer cleanup()

			var config map[string]interface{}
			err := yaml.Unmarshal(configData, &config)

			if err != nil {
				t.Fatalf(errMsgParseConfig, err)
			}

			validateConfig(t, config)
		})
	}
}

func TestConfigTimeouts(t *testing.T) {
	configData, err := os.ReadFile(configFile)

	if err != nil {
		t.Fatalf(errMsgReadConfig, err)
	}

	var config map[string]interface{}
	err = yaml.Unmarshal(configData, &config)

	if err != nil {
		t.Fatalf(errMsgParseConfig, err)
	}

	// タイムアウト値の検証
	server := config["server"].(map[string]interface{})
	timeout, err := time.ParseDuration(server["timeout"].(string))
	assert.NoError(t, err)
	assert.True(t, timeout > 0)

	shutdownTimeout, err := time.ParseDuration(server["shutdown_timeout"].(string))
	assert.NoError(t, err)
	assert.True(t, shutdownTimeout > 0)
}

func TestConfigSecurity(t *testing.T) {
	configData, err := os.ReadFile(configFile)

	if err != nil {
		t.Fatalf(errMsgReadConfig, err)
	}

	var config map[string]interface{}
	err = yaml.Unmarshal(configData, &config)

	if err != nil {
		t.Fatalf(errMsgParseConfig, err)
	}

	// セキュリティヘッダーの検証
	server := config["server"].(map[string]interface{})
	securityHeaders := server["security_headers"].(map[string]interface{})

	assert.Equal(t, "DENY", securityHeaders["x_frame_options"])
	assert.Equal(t, "nosniff", securityHeaders["x_content_type_options"])
	assert.Equal(t, "1; mode=block", securityHeaders["x_xss_protection"])
}
