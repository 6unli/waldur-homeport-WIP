import Axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

import { getNextPageUrl, parseResultCount } from '@waldur/core/api';
import { ENV } from '@waldur/core/services';
import { parseQueryString } from '@waldur/core/utils';

import { Fetcher, TableRequest } from './types';

export function getNextPageNumber(link: string): number {
  if (link) {
    const parts = parseQueryString(link.split('/?')[1]);
    if (parts && parts.page) {
      return parseInt(parts.page, 10);
    }
  } else {
    return null;
  }
}

export const parseResponse = (url, params, options?: AxiosRequestConfig) =>
  Axios.request({
    method: 'GET',
    url,
    params,
    ...options,
  }).then((response: AxiosResponse<any>) => {
    const resultCount = parseResultCount(response);
    return {
      rows: Array.isArray(response.data) ? response.data : [],
      resultCount,
      nextPage: getNextPageNumber(getNextPageUrl(response)),
    };
  });

export function createFetcher(
  endpoint: string,
  options?: AxiosRequestConfig,
): Fetcher {
  return (request: TableRequest) => {
    const url = `${ENV.apiEndpoint}api/${endpoint}/`;
    const params = {
      page: request.currentPage,
      page_size: request.pageSize,
      ...request.filter,
    };
    return parseResponse(url, params, options);
  };
}

export async function fetchAll(
  fetch: Fetcher,
  filter?: Record<string, string>,
) {
  const request: TableRequest = {
    pageSize: 50,
    currentPage: 1,
    filter,
  };

  let response = await fetch(request);
  let result = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    result = result.concat(response.rows);
    if (response.nextPage) {
      request.currentPage = response.nextPage;
      response = await fetch(request);
    } else {
      break;
    }
  }
  return result;
}

export const ANONYMOUS_CONFIG = {
  transformRequest: [
    (data, headers) => {
      delete headers.common.Authorization;
      return data;
    },
  ],
};
