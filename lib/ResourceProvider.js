/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';
const ResourceAdapter = require('./interfaces/ResourceAdapter');

/**
 *
 * @param {{}} options
 * @param {{}} options.adapters
 * @constructor
 */
function ResourceProvider(options) {

  var adapters = options.adapters || {};

  /**
   *
   * @param {String} type
   * @param {{}} [options]
   * @param {Number} [offset]
   * @param {Number} [count]
   * @return {Promise}
   */
  this.getResources = function (type, options, offset, count) {
    if (adapters[type] instanceof ResourceAdapter) {
      return adapters[type].getResources(options, offset, count);
    }
    return Promise.reject(new Error('Запрошены ресурсы неподдерживаемого типа ' + types[0]));
  };

  this.getResource = function (type, id) {
    if (adapters[type] instanceof ResourceAdapter) {
      return adapters[type].getResource(id);
    }
    return Promise.reject(new Error('Запрошен ресурс неподдерживаемого типа ' + type));
  };

}

module.exports = ResourceProvider;
