package repositories

import (
	"os"
	"testing"
	"university-exam-api/internal/domain/models"

	// "university-exam-api/internal/testutils" // import cycle の可能性があるため、一旦コメントアウトし、必要に応じて修正

	applogger "university-exam-api/internal/logger"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const errMsgCreateUniversity = "大学の作成に失敗"

// TestMain で .env を読み込む
func TestMain(m *testing.M) {
	_ = godotenv.Load("back/tests/testdata/.env")
	applogger.InitTestLogger()
	os.Exit(m.Run())
}

// テスト用ロガー初期化のためのimport
func importedLoggerInit() {
	// 明示的にapplogger.InitTestLogger()を呼ぶ
	// import cycle回避のためここでimport
	imported := false
	if !imported {
		imported = true
		// 下記のように直接呼び出し
		// applogger.InitTestLogger()
		// ただし、import cycleが発生する場合は、loggerパッケージのテスト用init.goでInitTestLoggerを呼ぶことも検討
	}
}

// setupTestDB はテスト用のデータベースをセットアップし、リポジトリとクリーンアップ関数を返します。
// db_test_helper.go の関数を利用することを想定。
func setupTestDB(t *testing.T) (IUniversityRepository, func()) {
	cfg := DefaultTestDBConfig()      // 引数なしで呼び出し
	db := SetupTestDB(t, cfg)          // *gorm.DB のみを返す
	require.NotNil(t, db, "テストデータベースのセットアップに失敗しました") // dbがnilでないことを確認

	repo := NewUniversityRepository(db)
	require.NotNil(t, repo, "リポジトリの初期化に失敗しました")

	cleanupFunc := func() {
		if err := CleanupTestData(db); err != nil { // 引数は *gorm.DB のみ
			t.Logf("テストデータのクリーンアップに失敗しました: %v", err)
		}
		sqlDB, err := db.DB() // ここでのエラーもハンドルすることが望ましい
		if err != nil {
			t.Logf("DBインスタンスの取得に失敗しました: %v", err)
			return
		}
		sqlDB.Close()
	}

	return repo, cleanupFunc
}

func TestNewUniversityRepository(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	assert.NotNil(t, repo, "NewUniversityRepositoryはnilでないリポジトリを返すべきです")
}

func TestUniversityCreateAndFind(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// ctx := context.Background() // 未使用のためコメントアウト

	t.Run("大学の作成とIDによる取得", func(t *testing.T) {
		// テストデータの作成
		uniToCreate := &models.University{
			BaseModel: models.BaseModel{Version: 1},
			Name: "テスト大学",
			Departments: []models.Department{
				{
					BaseModel: models.BaseModel{Version: 1},
					Name: "テスト学部",
					Majors: []models.Major{
						{
							BaseModel: models.BaseModel{Version: 1},
							Name: "テスト学科",
							AdmissionSchedules: []models.AdmissionSchedule{
								{
									BaseModel: models.BaseModel{Version: 1},
									Name:         "前",
									DisplayOrder: 1,
									AdmissionInfos: []models.AdmissionInfo{
										{BaseModel: models.BaseModel{Version: 1}, Enrollment: 100, AcademicYear: 2024, Status: "published"},
									},
									TestTypes: []models.TestType{
										{
											BaseModel: models.BaseModel{Version: 1},
											Name: "共通",
											Subjects: []models.Subject{
												{BaseModel: models.BaseModel{Version: 1}, Name: "国語", Score: 100, Percentage: 50, DisplayOrder: 1},
												{BaseModel: models.BaseModel{Version: 1}, Name: "数学", Score: 100, Percentage: 50, DisplayOrder: 2},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		}

		// 大学の作成
		// repo.Create は context を引数に取らないため、ctxなしで呼び出し
		err := repo.Create(uniToCreate)
		require.NoError(t, err, errMsgCreateUniversity)
		require.NotZero(t, uniToCreate.ID, "作成された大学はIDを持つべきです")
		require.NotEmpty(t, uniToCreate.Departments, "作成された大学は学部を持つべきです")
		require.NotZero(t, uniToCreate.Departments[0].ID, "作成された学部はIDを持つべきです")
		require.NotEmpty(t, uniToCreate.Departments[0].Majors, "作成された学部は学科を持つべきです")
		require.NotZero(t, uniToCreate.Departments[0].Majors[0].ID, "作成された学科はIDを持つべきです")
		// ... 他のエンティティのIDも同様に確認

		// IDによる大学の取得
		// repo.FindByID は context を引数に取らないため、ctxなしで呼び出し
		foundUni, err := repo.FindByID(uniToCreate.ID)
		require.NoError(t, err, "IDによる大学の取得中にエラーが発生すべきではありません")
		require.NotNil(t, foundUni, "取得された大学はnilであってはなりません")

		// 内容の検証
		assert.Equal(t, uniToCreate.Name, foundUni.Name, "大学名が一致しません")
		require.Len(t, foundUni.Departments, 1, "学部の数が正しくありません")
		assert.Equal(t, uniToCreate.Departments[0].Name, foundUni.Departments[0].Name, "学部名が一致しません")
		require.Len(t, foundUni.Departments[0].Majors, 1, "学科の数が正しくありません")
		assert.Equal(t, uniToCreate.Departments[0].Majors[0].Name, foundUni.Departments[0].Majors[0].Name, "学科名が一致しません")

		// AdmissionSchedules, TestTypes, Subjects の詳細な検証
		maj := foundUni.Departments[0].Majors[0]
		require.Len(t, maj.AdmissionSchedules, 1, "入試日程の数が正しくありません")
		sched := maj.AdmissionSchedules[0]
		assert.Equal(t, "前", sched.Name, "入試日程名が一致しません")
		assert.Equal(t, 1, sched.DisplayOrder, "入試日程のDisplayOrderが一致しません")
		require.Len(t, sched.AdmissionInfos, 1, "入試情報の数が正しくありません")
		info := sched.AdmissionInfos[0]
		assert.Equal(t, 100, info.Enrollment, "入試情報のEnrollmentが一致しません")
		assert.Equal(t, 2024, info.AcademicYear, "入試情報のAcademicYearが一致しません")
		assert.Equal(t, "published", info.Status, "入試情報のStatusが一致しません")
		require.Len(t, sched.TestTypes, 1, "試験種別の数が正しくありません")
		type1 := sched.TestTypes[0]
		assert.Equal(t, "共通", type1.Name, "試験種別名が一致しません")
		require.Len(t, type1.Subjects, 2, "科目の数が正しくありません")
		subj1 := type1.Subjects[0]
		subj2 := type1.Subjects[1]
		assert.Equal(t, "国語", subj1.Name, "科目1の名前が一致しません")
		assert.Equal(t, 100, subj1.Score, "科目1のスコアが一致しません")
		assert.Equal(t, 50.0, subj1.Percentage, "科目1のパーセンテージが一致しません")
		assert.Equal(t, 1, subj1.DisplayOrder, "科目1のDisplayOrderが一致しません")
		assert.Equal(t, "数学", subj2.Name, "科目2の名前が一致しません")
		assert.Equal(t, 100, subj2.Score, "科目2のスコアが一致しません")
		assert.Equal(t, 50.0, subj2.Percentage, "科目2のパーセンテージが一致しません")
		assert.Equal(t, 2, subj2.DisplayOrder, "科目2のDisplayOrderが一致しません")
	})

	t.Run("存在しないIDによる大学の取得", func(t *testing.T) {
		nonExistentID := uint(99999)
		// repo.FindByID は context を引数に取らないため、ctxなしで呼び出し
		notFoundUni, err := repo.FindByID(nonExistentID)
		assert.Error(t, err, "存在しないIDで検索した場合、エラーが返されるべきです")
		// appErrors.IsNotFoundError(err) のようなエラータイプのチェックが望ましい
		assert.Nil(t, notFoundUni, "存在しないIDで検索した場合、大学データはnilであるべきです")
	})
}

func TestUniversityUpdate(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// 大学を作成
	uni := &models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "更新前大学",
	}
	err := repo.Create(uni)
	require.NoError(t, err, errMsgCreateUniversity)

	// 名前を変更してUpdate
	uni.Name = "更新後大学"
	err = repo.Update(uni)
	require.NoError(t, err, "大学の更新に失敗")

	// 再取得して反映を確認
	updated, err := repo.FindByID(uni.ID)
	require.NoError(t, err, "更新後の大学取得に失敗")
	assert.Equal(t, "更新後大学", updated.Name, "大学名が更新されていない")
}

func TestUniversityDelete(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// 大学を作成
	uni := &models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "削除対象大学",
	}
	err := repo.Create(uni)
	require.NoError(t, err, errMsgCreateUniversity)

	// 削除
	err = repo.Delete(uni.ID)
	require.NoError(t, err, "大学の削除に失敗")

	// 削除後に取得できないことを確認
	deleted, err := repo.FindByID(uni.ID)
	assert.Error(t, err, "削除済み大学の取得はエラーとなるべき")
	assert.Nil(t, deleted, "削除済み大学はnilであるべき")
}

func TestUniversityFindAll(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// 複数の大学を作成
	names := []string{"大学A", "大学B", "大学C"}
	for _, name := range names {
		uni := &models.University{
			BaseModel: models.BaseModel{Version: 1},
			Name: name,
		}
		err := repo.Create(uni)
		require.NoError(t, err, errMsgCreateUniversity+": %s", name)
	}

	// 全大学を取得
	unis, err := repo.FindAll(nil)
	require.NoError(t, err, "全大学の取得に失敗")
	assert.GreaterOrEqual(t, len(unis), len(names), "大学の件数が正しくありません")

	// 作成した大学名が含まれているか確認
	found := map[string]bool{}
	for _, uni := range unis {
		found[uni.Name] = true
	}
	for _, name := range names {
		assert.True(t, found[name], "大学 %s がFindAll結果に含まれていません", name)
	}
}

func TestUniversitySearch(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// テストデータ作成
	uni1 := &models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "東京大学",
		Departments: []models.Department{
			{
				BaseModel: models.BaseModel{Version: 1},
				Name: "理学部",
				Majors: []models.Major{
					{BaseModel: models.BaseModel{Version: 1}, Name: "物理学科"},
				},
			},
		},
	}
	uni2 := &models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "京都大学",
		Departments: []models.Department{
			{
				BaseModel: models.BaseModel{Version: 1},
				Name: "工学部",
				Majors: []models.Major{
					{BaseModel: models.BaseModel{Version: 1}, Name: "電気電子工学科"},
				},
			},
		},
	}
	require.NoError(t, repo.Create(uni1), errMsgCreateUniversity)
	require.NoError(t, repo.Create(uni2), errMsgCreateUniversity)

	t.Run("大学名で検索", func(t *testing.T) {
		results, err := repo.Search("東京")
		require.NoError(t, err)
		assert.NotEmpty(t, results, "大学名で検索してヒットしない")
		var found bool
		for _, u := range results {
			if u.Name == "東京大学" {
				found = true
			}
		}
		assert.True(t, found, "東京大学が検索結果に含まれていない")
	})

	t.Run("学部名で検索", func(t *testing.T) {
		results, err := repo.Search("工学部")
		require.NoError(t, err)
		assert.NotEmpty(t, results, "学部名で検索してヒットしない")
		var found bool
		for _, u := range results {
			if u.Name == "京都大学" {
				found = true
			}
		}
		assert.True(t, found, "京都大学が検索結果に含まれていない")
	})

	t.Run("学科名で検索", func(t *testing.T) {
		results, err := repo.Search("物理")
		require.NoError(t, err)
		assert.NotEmpty(t, results, "学科名で検索してヒットしない")
		var found bool
		for _, u := range results {
			if u.Name == "東京大学" {
				found = true
			}
		}
		assert.True(t, found, "東京大学が検索結果に含まれていない")
	})
}

func TestUniversityErrorCases(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	t.Run("空の大学名で作成", func(t *testing.T) {
		uni := &models.University{
			BaseModel: models.BaseModel{Version: 1},
			Name: "",
		}
		err := repo.Create(uni)
		assert.Error(t, err, "空の大学名で作成はエラーとなるべき")
	})

	t.Run("空の検索クエリ", func(t *testing.T) {
		results, err := repo.Search("")
		assert.Error(t, err, "空の検索クエリはエラーとなるべき")
		assert.Nil(t, results, "空の検索クエリの結果はnilであるべき")
	})

	t.Run("存在しないIDでUpdate", func(t *testing.T) {
		uni := &models.University{
			BaseModel: models.BaseModel{ID: 99999, Version: 1},
			Name: "存在しない大学",
		}
		err := repo.Update(uni)
		assert.Error(t, err, "存在しないIDでUpdateはエラーとなるべき")
	})

	t.Run("存在しないIDでDelete", func(t *testing.T) {
		err := repo.Delete(99999)
		assert.Error(t, err, "存在しないIDでDeleteはエラーとなるべき")
	})

	t.Run("存在しないIDでFindByID", func(t *testing.T) {
		uni, err := repo.FindByID(99999)
		assert.Error(t, err, "存在しないIDでFindByIDはエラーとなるべき")
		assert.Nil(t, uni, "存在しないIDでFindByIDの結果はnilであるべき")
	})
}

func TestUniversityCacheLogic(t *testing.T) {
	repo, cleanup := setupTestDB(t)
	defer cleanup()

	// 大学を作成
	uni := &models.University{
		BaseModel: models.BaseModel{Version: 1},
		Name: "テスト大学",
	}
	err := repo.Create(uni)
	require.NoError(t, err, errMsgCreateUniversity)

	// 1回目のFindByID（キャッシュミス→DBアクセス）
	found1, err := repo.FindByID(uni.ID)
	require.NoError(t, err)
	assert.Equal(t, uni.Name, found1.Name)

	// 2回目のFindByID（キャッシュヒットを期待）
	found2, err := repo.FindByID(uni.ID)
	require.NoError(t, err)
	assert.Equal(t, uni.Name, found2.Name)

	// 大学を削除（キャッシュクリアされるはず）
	err = repo.Delete(uni.ID)
	require.NoError(t, err)

	// 削除後のFindByID（キャッシュミス＋DBにも存在しない）
	found3, err := repo.FindByID(uni.ID)
	assert.Error(t, err)
	assert.Nil(t, found3)
}
