import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/vue-element-admin/article/create',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
export function yeziyuList(query) {
  return request({
    url: '/vue-element-admin/article/yeziyu_list',
    method: 'get',
    params: query
  })
}

export function yeziyuCreateArticle(data) {
  return request({
    url: '/vue-element-admin/article/yeziyu_create',
    method: 'post',
    data
  })
}

export function yeziyuUpdateArticle(data) {
  return request({
    url: '/vue-element-admin/article/yeziyu_update',
    method: 'post',
    data
  })
}
