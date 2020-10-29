/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/14/17.
 */
'use strict';
const ResourceAdapter = require('../../interfaces/ResourceAdapter');
const Resource = require('../../interfaces/Resource');
const {t} = require('core/i18n');

/**
 *
 * @param {{}} options
 * @param {DataRepository} options.dataRepo
 * @param {String} options.className
 * @param {{}} options.filter,
 * @param {String[][]|{}} forceEnrichment
 * @param {{title: String, date: String, contents: String}} [options.map]
 * @constructor
 */
function ClassAdapter(options) {

  if (!options.dataRepo) {
    throw new Error(t('IonClassAdapter: data repository not specified.'));
  }

  if (!options.className) {
    throw new Error(t('IonClassAdapter: published class name not specified.'));
  }

  let map = options.map || {};
  let forceEnrichment = ((options.forceEnrichment && Array.isArray(options.forceEnrichment)) && options.forceEnrichment) || [];
  let listForceEnrichment = ((options.forceEnrichment && options.forceEnrichment.list) && options.forceEnrichment.list) || forceEnrichment;
  let itemForceEnrichment = ((options.forceEnrichment && options.forceEnrichment.item) && options.forceEnrichment.item) || forceEnrichment;

  /**
   * @param {Item} item
   * @constructor
   */
  function ICResource(item) {
    /**
     * @returns {String}
     */
    this._id = function () {
      return item.getItemId();
    };

    /**
     * @returns {String}
     */
    this._title = function () {
      if (map.title) {
        return item.property(map.title).getDisplayValue();
      }
      return item.toString() || '';
    };

    /**
     * @returns {Date | null}
     */
    this._date = function () {
      if (map.date) {
        return item.get(map.date);
      }
      return null;
    };

    /**
     * @returns {String}
     */
    this._content = function () {
      if (map.content) {
        return item.property(map.content).getDisplayValue();
      }
      return '';
    };

    /**
     * @returns {Item}
     */
    this.getItem = function () {
      return item;
    };
  }

  ICResource.prototype = new Resource();

  /**
   *
   * @param {{}} opts
   * @param {{}} [opts.filter]
   * @param {{}} [opts.sort]
   * @param {Number} [offset]
   * @param {Number} [count]
   * @return {Promise.<Resource[]>}
   * @private
   */
  this._getResources = function (opts, offset, count) {
    var filter = {
      filter: Object.assign(options.filter || {}, opts.filter),
      count: count || options.count || count,
      offset: offset || 0,
      countTotal: true,
      forceEnrichment: listForceEnrichment
    };
    return options.dataRepo.getList(options.className, filter)
      .then(
        /**
         * @param {Item[]} items
         */
        function (items) {
          var result = [];
          if (Array.isArray(items) && items.length) {
            items.forEach(function (i) {
              result.push(new ICResource(i));
            });
          }
          result.total = items.total;
          return Promise.resolve(result);
        }
      );
  };

  /**
   *
   * @param {String} id
   * @return {Promise.<Resource>}
   */
  this.getResource = function (id) {
    return options.dataRepo.getItem(options.className, id, {forceEnrichment: itemForceEnrichment})
    /**
     * @param {Item} item
     */
      .then(function (item) {
        if (!item) {
          return Promise.resolve(null);
        }
        return Promise.resolve(new ICResource(item));
      });
  };
}

ClassAdapter.prototype = new ResourceAdapter();
module.exports = ClassAdapter;
