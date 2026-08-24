import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const { productRankBegin, productRankSuccess, productRankErr } = actions;

export const getProductRanking = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(productRankBegin());
    try {
      let url = `/amazon/catalog-list-details/?page=${page}&page_size=${pageSize}`;
      if (payload?.search) {
        url += `&search=${encodeURIComponent(payload.search)}`;
      }
      const response = await DataService.get(url);
      if (response.data.status === 'success') {
        dispatch(productRankSuccess(response.data));
      } else {
        dispatch(productRankErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(productRankErr(err.response?.data?.message || err.message));
    }
  };
};

export const exportCatalogDetails = (payload = {}, format = 'xlsx') => {
  return async () => {
    try {
      let url = `/amazon/catalog-list-details/export/?file_format=${format}`;
      if (payload?.search) {
        url += `&search=${encodeURIComponent(payload.search)}`;
      }
      const response = await DataService.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const urlObj = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlObj;

      let filename = `catalog_list_details.${format}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        const [, matchedFilename] = match || [];
        if (matchedFilename) {
          filename = matchedFilename;
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(urlObj);
      return { status: true, filename };
    } catch (err) {
      console.error('Export catalog details error:', err);
      return { status: false, message: err.message };
    }
  };
};
