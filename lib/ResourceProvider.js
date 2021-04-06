/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';
const ResourceAdapter = require('./interfaces/ResourceAdapter');
const {t} = require('@iondv/i18n');
const {format} = require('util');

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
    return Promise.reject(new Error(format(t('Resource type %s is unsupported'), types[0])));
  };

  this.getResource = function (type, id) {
    if (adapters[type] instanceof ResourceAdapter) {
      return adapters[type].getResource(id);
    }
    return Promise.reject(new Error(format(t('Resource type %s is unsupported'), type)));
  };

}

module.exports = ResourceProvider;
