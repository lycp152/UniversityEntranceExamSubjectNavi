import type { DepartmentInfoProps } from './types';
import { EditMode } from './EditMode';
import { ViewMode } from './ViewMode';

export const DepartmentInfo = (props: DepartmentInfoProps) => {
  if (props.isEditing) {
    return <EditMode {...props} />;
  }
  return <ViewMode {...props} />;
};
