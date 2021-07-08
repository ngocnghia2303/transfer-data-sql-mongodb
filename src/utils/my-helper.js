import * as _ from 'lodash'

function getPaginatedItems(items, pageSize) {
  return Math.ceil(items.length / pageSize) ;
}

function getItemPage(items, page, size) {
  const offset = (page - 1) * size;
  return _.drop(items, offset).slice(0, size);
}

export function toPages(items, pageSize) {
  const data = {
    totalPages: getPaginatedItems(items, pageSize),
    pages: []
  }
  for (let index = 1; index <= data.totalPages; index++) {
  
    data.pages.push(getItemPage(items, index, pageSize))
  }
  return data
}