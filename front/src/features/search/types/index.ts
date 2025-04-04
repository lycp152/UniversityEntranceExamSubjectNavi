export type SearchFormState = {
  message?: string;
  errors?: {
    keyword?: string[];
    type?: string[];
    location?: string[];
    region?: string[];
    academicField?: string[];
    schedule?: string[];
    classification?: string[];
    sortOrder?: string[];
    page?: string[];
    perPage?: string[];
  };
};
