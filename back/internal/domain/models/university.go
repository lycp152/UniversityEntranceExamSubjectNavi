package models

import (
	"gorm.io/gorm"
)

// BatchCreateUniversities は複数の大学を一括で作成します
func BatchCreateUniversities(db *gorm.DB, universities []University) error {
    return db.Transaction(func(tx *gorm.DB) error {
        // チャンクサイズを指定してバルクインサート
        const chunkSize = 100
        for i := 0; i < len(universities); i += chunkSize {
            end := i + chunkSize
            if end > len(universities) {
                end = len(universities)
            }

            if err := tx.Create(universities[i:end]).Error; err != nil {
                return err
            }
        }
        return nil
    })
}

// BatchUpdateUniversities は複数の大学を一括で更新します
func BatchUpdateUniversities(db *gorm.DB, universities []University) error {
    return db.Transaction(func(tx *gorm.DB) error {
        for _, university := range universities {
            if err := tx.Save(&university).Error; err != nil {
                return err
            }
        }
        return nil
    })
}
