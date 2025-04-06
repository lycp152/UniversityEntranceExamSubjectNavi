package handlers

import (
	"context"
	"net/http"
	"strconv"
	"university-exam-api/internal/domain/models"
	"university-exam-api/internal/errors"
	applogger "university-exam-api/internal/logger"
	"university-exam-api/internal/repositories"

	"github.com/labstack/echo/v4"
)

const (
	errInvalidUniversityIDFormat = "Invalid university ID format: %v"
	errMsgInvalidUniversityID = "Invalid university ID format"
	errInvalidDepartmentIDFormat = "Invalid department ID format: %v"
	errMsgInvalidDepartmentID = "Invalid department ID format"
	errInvalidSubjectIDFormat = "Invalid subject ID format: %v"
	errMsgInvalidSubjectID = "Invalid subject ID format"
	errMsgInvalidRequestBody = "Invalid request body"
	errInvalidScheduleIDFormat = "Invalid schedule ID format: %v"
	errMsgInvalidScheduleID = "Invalid schedule ID format"
)

type UniversityHandler struct {
    repo repositories.IUniversityRepository
}

func NewUniversityHandler(repo repositories.IUniversityRepository) *UniversityHandler {
    return &UniversityHandler{repo: repo}
}

// handleError は各種エラーを適切なHTTPレスポンスに変換します
func handleError(c echo.Context, err error) error {
    switch e := err.(type) {
    case *errors.Error:
        statusCode := http.StatusInternalServerError
        switch e.Code {
        case errors.NotFound:
            statusCode = http.StatusNotFound
        case errors.InvalidInput, errors.Validation:
            statusCode = http.StatusBadRequest
        case errors.Authentication:
            statusCode = http.StatusUnauthorized
        case errors.Authorization:
            statusCode = http.StatusForbidden
        }
        return c.JSON(statusCode, map[string]interface{}{
            "code": e.Code,
            "message": e.Message,
            "details": e.Details,
        })
    default:
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "error": "Internal server error occurred",
        })
    }
}

// parseID は文字列のIDをuintに変換します
func parseID(idStr string, errFormat string, errMsg string) (uint, error) {
    id, err := strconv.ParseUint(idStr, 10, 32)
    if err != nil {
        applogger.Error(context.Background(), errFormat, err)
        return 0, errors.NewInvalidInputError("id", errMsg, nil)
    }
    return uint(id), nil
}

func (h *UniversityHandler) GetUniversities(c echo.Context) error {
    universities, err := h.repo.FindAll(c.Request().Context())
    if err != nil {
        applogger.Error(c.Request().Context(), "Failed to fetch universities: %v", err)
        return handleError(c, err)
    }
    applogger.Info(c.Request().Context(), "Successfully fetched %d universities", len(universities))
    return c.JSON(http.StatusOK, universities)
}

func (h *UniversityHandler) GetUniversity(c echo.Context) error {
    id, err := parseID(c.Param("id"), errInvalidUniversityIDFormat, errMsgInvalidUniversityID)
    if err != nil {
        return handleError(c, err)
    }

    university, err := h.repo.FindByID(id)
    if err != nil {
        applogger.Error(c.Request().Context(), "Failed to fetch university with ID %d: %v", id, err)
        return handleError(c, err)
    }
    applogger.Info(c.Request().Context(), "Successfully fetched university with ID %d", id)
    return c.JSON(http.StatusOK, university)
}

func (h *UniversityHandler) SearchUniversities(c echo.Context) error {
    query := c.QueryParam("q")
    universities, err := h.repo.Search(query)
    if err != nil {
        applogger.Error(c.Request().Context(), "Failed to search universities with query '%s': %v", query, err)
        return handleError(c, err)
    }
    applogger.Info(c.Request().Context(), "Successfully searched universities with query '%s', found %d results", query, len(universities))
    return c.JSON(http.StatusOK, universities)
}

func (h *UniversityHandler) GetDepartment(c echo.Context) error {
    universityID, err := strconv.ParseUint(c.Param("universityId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidUniversityIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidUniversityID,
        })
    }

    departmentID, err := strconv.ParseUint(c.Param("departmentId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidDepartmentIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidDepartmentID,
        })
    }

    department, err := h.repo.FindDepartment(uint(universityID), uint(departmentID))
    if err != nil {
        applogger.Error(c.Request().Context(), "Failed to fetch department (universityID: %d, departmentID: %d): %v", universityID, departmentID, err)
        return handleError(c, err)
    }
    applogger.Info(c.Request().Context(), "Successfully fetched department (universityID: %d, departmentID: %d)", universityID, departmentID)
    return c.JSON(http.StatusOK, department)
}

func (h *UniversityHandler) GetSubject(c echo.Context) error {
    departmentID, err := strconv.ParseUint(c.Param("departmentId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), "Invalid department ID format: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Invalid department ID format",
        })
    }

    subjectID, err := strconv.ParseUint(c.Param("subjectId"), 10, 32)
    if err != nil {
        applogger.Error(context.Background(), errInvalidSubjectIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidSubjectID,
        })
    }

    subject, err := h.repo.FindSubject(uint(departmentID), uint(subjectID))
    if err != nil {
        applogger.Error(c.Request().Context(), "Failed to fetch subject (departmentID: %d, subjectID: %d): %v", departmentID, subjectID, err)
        return handleError(c, err)
    }
    applogger.Info(c.Request().Context(), "Successfully fetched subject (departmentID: %d, subjectID: %d)", departmentID, subjectID)
    return c.JSON(http.StatusOK, subject)
}

// CreateUniversity は新しい大学を作成します
func (h *UniversityHandler) CreateUniversity(c echo.Context) error {
    var university models.University
    if err := c.Bind(&university); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind university data: %v", err)
        return handleError(c, errors.NewInvalidInputError("university", errMsgInvalidRequestBody, nil))
    }

    if err := h.repo.Create(&university); err != nil {
        applogger.Error(c.Request().Context(), "Failed to create university: %v", err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully created university with ID %d", university.ID)
    return c.JSON(http.StatusCreated, university)
}

// UpdateUniversity は既存の大学を更新します
func (h *UniversityHandler) UpdateUniversity(c echo.Context) error {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidUniversityIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidUniversityID,
        })
    }

    var university models.University
    if err := c.Bind(&university); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind university data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    university.ID = uint(id)
    if err := h.repo.Update(&university); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update university with ID %d: %v", id, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated university with ID %d", id)
    return c.JSON(http.StatusOK, university)
}

// DeleteUniversity は大学を削除します
func (h *UniversityHandler) DeleteUniversity(c echo.Context) error {
    id, err := strconv.ParseUint(c.Param("id"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidUniversityIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidUniversityID,
        })
    }

    if err := h.repo.Delete(uint(id)); err != nil {
        applogger.Error(c.Request().Context(), "Failed to delete university with ID %d: %v", id, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully deleted university with ID %d", id)
    return c.NoContent(http.StatusNoContent)
}

// CreateDepartment は新しい学部を作成します
func (h *UniversityHandler) CreateDepartment(c echo.Context) error {
    universityID, err := strconv.ParseUint(c.Param("universityId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidUniversityIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidUniversityID,
        })
    }

    var department models.Department
    if err := c.Bind(&department); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind department data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    department.UniversityID = uint(universityID)
    if err := h.repo.CreateDepartment(&department); err != nil {
        applogger.Error(c.Request().Context(), "Failed to create department: %v", err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully created department with ID %d", department.ID)
    return c.JSON(http.StatusCreated, department)
}

// UpdateDepartment は既存の学部を更新します
func (h *UniversityHandler) UpdateDepartment(c echo.Context) error {
    departmentID, err := strconv.ParseUint(c.Param("departmentId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidDepartmentIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidDepartmentID,
        })
    }

    var department models.Department
    if err := c.Bind(&department); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind department data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    department.ID = uint(departmentID)
    if err := h.repo.UpdateDepartment(&department); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update department with ID %d: %v", departmentID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated department with ID %d", departmentID)
    return c.JSON(http.StatusOK, department)
}

// DeleteDepartment は学部を削除します
func (h *UniversityHandler) DeleteDepartment(c echo.Context) error {
    departmentID, err := strconv.ParseUint(c.Param("departmentId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidDepartmentIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidDepartmentID,
        })
    }

    if err := h.repo.DeleteDepartment(uint(departmentID)); err != nil {
        applogger.Error(c.Request().Context(), "Failed to delete department with ID %d: %v", departmentID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully deleted department with ID %d", departmentID)
    return c.NoContent(http.StatusNoContent)
}

// CreateSubject は新しい科目を作成します
func (h *UniversityHandler) CreateSubject(c echo.Context) error {
    scheduleID, err := strconv.ParseUint(c.Param("scheduleId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidScheduleIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidScheduleID,
        })
    }

    var subject models.Subject
    if err := c.Bind(&subject); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind subject data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    subject.TestTypeID = uint(scheduleID)
    if err := h.repo.CreateSubject(&subject); err != nil {
        applogger.Error(c.Request().Context(), "Failed to create subject: %v", err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully created subject with ID %d", subject.ID)
    return c.JSON(http.StatusCreated, subject)
}

// UpdateSubject は科目を更新します
func (h *UniversityHandler) UpdateSubject(c echo.Context) error {
    subjectID, err := strconv.ParseUint(c.Param("subjectId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidSubjectIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidSubjectID,
        })
    }

    var subject models.Subject
    if err := c.Bind(&subject); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind subject data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    subject.ID = uint(subjectID)
    if err := h.repo.UpdateSubject(&subject); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update subject with ID %d: %v", subjectID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated subject with ID %d", subjectID)
    return c.JSON(http.StatusOK, subject)
}

// DeleteSubject は科目を削除します
func (h *UniversityHandler) DeleteSubject(c echo.Context) error {
    subjectID, err := strconv.ParseUint(c.Param("subjectId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidSubjectIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidSubjectID,
        })
    }

    if err := h.repo.DeleteSubject(uint(subjectID)); err != nil {
        applogger.Error(c.Request().Context(), "Failed to delete subject with ID %d: %v", subjectID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully deleted subject with ID %d", subjectID)
    return c.NoContent(http.StatusNoContent)
}

// UpdateSubjectsBatch は複数の科目を一括で更新します
func (h *UniversityHandler) UpdateSubjectsBatch(c echo.Context) error {
    scheduleID, err := strconv.ParseUint(c.Param("scheduleId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidScheduleIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidScheduleID,
        })
    }

    var subjects []models.Subject
    if err := c.Bind(&subjects); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind subjects data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    if err := h.repo.UpdateSubjectsBatch(uint(scheduleID), subjects); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update subjects batch: %v", err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated subjects batch")
    return c.JSON(http.StatusOK, subjects)
}

// GetCSRFToken はCSRFトークンを返します
func (h *UniversityHandler) GetCSRFToken(c echo.Context) error {
	// 新しいCSRFトークンを生成
	token := c.Get("csrf")
	if token == nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "CSRFトークンの生成に失敗しました",
		})
	}

	tokenStr, ok := token.(string)
	if !ok {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "CSRFトークンの型が不正です",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"token": tokenStr,
	})
}

// UpdateMajor は学科情報を更新します
func (h *UniversityHandler) UpdateMajor(c echo.Context) error {
    departmentID, err := strconv.ParseUint(c.Param("departmentId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidDepartmentIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidDepartmentID,
        })
    }

    majorID, err := strconv.ParseUint(c.Param("majorId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), "Invalid major ID format: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Invalid major ID format",
        })
    }

    var major models.Major
    if err := c.Bind(&major); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind major data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    major.ID = uint(majorID)
    major.DepartmentID = uint(departmentID)
    if err := h.repo.UpdateMajor(&major); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update major with ID %d: %v", majorID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated major with ID %d", majorID)
    return c.JSON(http.StatusOK, major)
}

// UpdateAdmissionSchedule は入試日程を更新します
func (h *UniversityHandler) UpdateAdmissionSchedule(c echo.Context) error {
    majorID, err := strconv.ParseUint(c.Param("majorId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), "Invalid major ID format: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Invalid major ID format",
        })
    }

    scheduleID, err := strconv.ParseUint(c.Param("scheduleId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidScheduleIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidScheduleID,
        })
    }

    var schedule models.AdmissionSchedule
    if err := c.Bind(&schedule); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind admission schedule data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    schedule.ID = uint(scheduleID)
    schedule.MajorID = uint(majorID)
    if err := h.repo.UpdateAdmissionSchedule(&schedule); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update admission schedule with ID %d: %v", scheduleID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated admission schedule with ID %d", scheduleID)
    return c.JSON(http.StatusOK, schedule)
}

// UpdateAdmissionInfo は募集人数を更新します
func (h *UniversityHandler) UpdateAdmissionInfo(c echo.Context) error {
    scheduleID, err := strconv.ParseUint(c.Param("scheduleId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), errInvalidScheduleIDFormat, err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidScheduleID,
        })
    }

    infoID, err := strconv.ParseUint(c.Param("infoId"), 10, 32)
    if err != nil {
        applogger.Error(c.Request().Context(), "Invalid info ID format: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Invalid info ID format",
        })
    }

    var info models.AdmissionInfo
    if err := c.Bind(&info); err != nil {
        applogger.Error(c.Request().Context(), "Failed to bind admission info data: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": errMsgInvalidRequestBody,
        })
    }

    info.ID = uint(infoID)
    info.AdmissionScheduleID = uint(scheduleID)
    if err := h.repo.UpdateAdmissionInfo(&info); err != nil {
        applogger.Error(c.Request().Context(), "Failed to update admission info with ID %d: %v", infoID, err)
        return handleError(c, err)
    }

    applogger.Info(c.Request().Context(), "Successfully updated admission info with ID %d", infoID)
    return c.JSON(http.StatusOK, info)
}
