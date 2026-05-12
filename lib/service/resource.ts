import { get, deleteRequest, post } from '../axiosInstance';

// 🔹 Upload Resource (multipart)
export const uploadResource = (
  formData: FormData,
  tenantId: string,
  token?: string,
) => post(
  '/v1/resources/file_upload',
  formData,
  undefined,
  tenantId,
  {
    isFetchToken: !token,
    bearerToken: token,
    contentType: 'multipart/form-data', // ✅ THIS is the missing piece
  },
);
// 🔹 Get Resources
export const getResources = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/resources',
  undefined,
  tenantId,
  {
    isFetchToken: !token,
    bearerToken: token,
  },
);

// 🔹 Delete Resource
export const deleteResource = (
  id: string,
  tenantId: string,
  token?: string,
) => deleteRequest(
  `/v1/resources/${id}`,
  undefined,
  tenantId,
  {
    isFetchToken: !token,
    bearerToken: token,
  },
);
