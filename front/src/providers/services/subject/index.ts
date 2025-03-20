import { TransformService } from "@/lib/utils/subject/transformService";
import { SubjectValidator } from "../validation/subjectValidationService";

// サービスのシングルトンインスタンス
let transformServiceInstance: TransformService | null = null;
let subjectValidatorInstance: SubjectValidator | null = null;

// サービスのインスタンス取得
export const getTransformService = (): TransformService => {
  if (!transformServiceInstance) {
    transformServiceInstance = new TransformService();
  }
  return transformServiceInstance;
};

export const getSubjectValidator = (): SubjectValidator => {
  if (!subjectValidatorInstance) {
    subjectValidatorInstance = new SubjectValidator();
  }
  return subjectValidatorInstance;
};

// サービスのエクスポート
export { TransformService, SubjectValidator };
