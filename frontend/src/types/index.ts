export interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image: string | null;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image: FileList;
}

export interface SchoolCreateData {
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  email_id: string;
  image?: File;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface SchoolsResponse extends APIResponse<School[]> {
  count: number;
}

export interface SchoolResponse extends APIResponse<School> {}

export interface CreateSchoolResponse extends APIResponse<School> {
  message: string;
}