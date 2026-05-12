import { get } from '../axiosInstance';

export const getStandardList = (
  tenantId: string,
  token?: string,
) => get(
  '/v1/standards',
  {
    limit: 1000,
  },
  tenantId,
  {
    isFetchToken: !token,
    bearerToken: token,
  },
);
