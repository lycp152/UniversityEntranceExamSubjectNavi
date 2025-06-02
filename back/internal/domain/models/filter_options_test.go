package models

import (
	"testing"
)

func TestFilterOptionValidate(t *testing.T) {
	tests := []struct {
		name    string
		option  FilterOption
		wantErr bool
	}{
		{
			name: "有効な地域カテゴリ",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "REGION",
				Name:       "南関東",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "無効なカテゴリ",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "INVALID",
				Name:       "テスト",
				DisplayOrder: 1,
			},
			wantErr: true,
		},
		{
			name: "地域カテゴリの名前が長すぎる",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "REGION",
				Name:       "南関東南",
				DisplayOrder: 1,
			},
			wantErr: true,
		},
		{
			name: "都道府県カテゴリの有効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "PREFECTURE",
				Name:       "東京",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "日程カテゴリの有効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "SCHEDULE",
				Name:       "前",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "日程カテゴリの無効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "SCHEDULE",
				Name:       "前期",
				DisplayOrder: 1,
			},
			wantErr: true,
		},
		{
			name: "学問系統カテゴリの有効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "ACADEMIC_FIELD",
				Name:       "工学",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "設置区分カテゴリの有効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "CLASSIFICATION",
				Name:       "国公立",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "小分類カテゴリの有効な名前",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "SUB_CLASSIFICATION",
				Name:       "東京一工（東京、京都、一橋、東工）",
				DisplayOrder: 1,
			},
			wantErr: false,
		},
		{
			name: "表示順序が範囲外",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "REGION",
				Name:       "南関東",
				DisplayOrder: 1000,
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.option.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("FilterOption.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestFilterOptionValidateWithParent(t *testing.T) {
	tests := []struct {
		name    string
		option  FilterOption
		wantErr bool
	}{
		{
			name: "有効な親子関係",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "REGION",
				Name:       "南関東",
				DisplayOrder: 1,
				ParentID:   new(uint),
				Parent: &FilterOption{
					BaseModel: BaseModel{Version: 1},
					Category:    "PREFECTURE",
					Name:       "東京",
					DisplayOrder: 1,
				},
			},
			wantErr: false,
		},
		{
			name: "無効な親子関係（カテゴリの不一致）",
			option: FilterOption{
				BaseModel: BaseModel{Version: 1},
				Category:    "PREFECTURE",
				Name:       "東京",
				DisplayOrder: 1,
				ParentID:   new(uint),
				Parent: &FilterOption{
					BaseModel: BaseModel{Version: 1},
					Category:    "SCHEDULE",
					Name:       "前",
					DisplayOrder: 1,
				},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.option.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("FilterOption.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
