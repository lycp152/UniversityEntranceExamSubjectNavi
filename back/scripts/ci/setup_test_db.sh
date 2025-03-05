#!/bin/bash

# PostgreSQLの設定
PGUSER="user"
PGHOST="localhost"
PGPORT="5432"
TEST_DB="university_exam_test_db"

# テストデータベースが存在する場合は削除
psql -U $PGUSER -h $PGHOST -p $PGPORT -d postgres -c "DROP DATABASE IF EXISTS $TEST_DB;"

# テストデータベースを作成
psql -U $PGUSER -h $PGHOST -p $PGPORT -d postgres -c "CREATE DATABASE $TEST_DB;"

echo "Test database setup completed."
