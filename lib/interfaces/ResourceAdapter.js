/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

function ResourceAdapter() {

  /**
   *
   * @param {{}} options
   * @param {Number} [offset]
   * @param {Number} [count]
   * @return {Promise.<Resource[]>}
   */
  this.getResources = function (options, offset, count) {
    return this._getResources(options, offset, count);
  };

  /**
   *
   * @param {String} id
   * @return {Promise.<Resource>}
   */
  this.getResource = function (id) {
    return this._getResource(id);
  };

}

module.exports = ResourceAdapter;
