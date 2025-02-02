export const getCategoryFromSubject = (subjectName: string): string => {
  return subjectName.replace(/[RL]$/, "");
};

export const getDisplayName = (subjectName: string): string => {
  return subjectName.replace(/^[^RLa-z]+/, "");
};
