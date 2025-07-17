// src/utils/api.js
// Bu dosya, projede tekrar eden API çağrılarını ve hata yönetimini merkezi olarak yönetmek için oluşturulmuştur.
// Tüm axios/fetch işlemleri ve hata yönetimi burada fonksiyonel olarak toplanır.

import axios from 'axios';

/**
 * API'ye yetkili GET isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiGet = async (url) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * API'ye yetkili POST isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object|FormData} data - Gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiPost = async (url, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(url, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * API'ye yetkili PUT isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object} data - Gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiPut = async (url, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(url, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * API'ye yetkili DELETE isteği atar.
 * @param {string} url - İstek yapılacak endpoint.
 * @param {object} [data] - Opsiyonel olarak gönderilecek veri.
 * @returns {Promise<any>} - API'den dönen veri.
 */
export const apiDelete = async (url, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
      data
    });
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * API hatalarını okunabilir hale getirir.
 * @param {any} error - Axios veya fetch hatası.
 * @returns {string} - Okunabilir hata mesajı.
 */
export const parseApiError = (error) => {
  if (error.response && error.response.data) {
    if (typeof error.response.data === 'string') return error.response.data;
    if (error.response.data.errors) {
      return Object.values(error.response.data.errors).flat().join(' ');
    }
    if (error.response.data.title) return error.response.data.title;
  }
  return error.message || 'Bilinmeyen bir hata oluştu.';
}; 