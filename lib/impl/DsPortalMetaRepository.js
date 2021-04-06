/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/12/17.
 */
'use strict';

const PortalMetaRepository = require('../interfaces/PortalMetaRepository');
const moduleName = require('../../module-name');
const {t} = require('@iondv/i18n');

/**
 *
 * @param {{}} options
 * @param {DataSource} options.dataSource
 * @param {String} [options.navTableName]
 * @constructor
 */
function DsPortalMetaRepository(options) {

  if (!options.dataSource) {
    throw new Error(t('Meta model repository data source not set up.'));
  }

  /**
   *
   * @type {DataSource}
   */
  var ds = this.dataSource = options.dataSource;

  var navTableName = options.navTableName || 'ion_portal_nav';

  var sections = {};

  var nodes = {};

  this._init = function () {
    return new Promise(function (resolve, reject) {
      sections = {};
      nodes = {};

      function enrichNodes(node) {
        node.url = node.url || '/' + moduleName + '/' + node.code;
        if (Array.isArray(node.subNodes) && node.subNodes.length) {
          let subNodes = [];
          node.subNodes.forEach(function (subNode) {
            if (nodes[subNode]) {
              subNodes.push(nodes[subNode]);
            }
          });
          node.subNodes = subNodes;
        }
      }

      ds.ensureIndex(navTableName, [{code: 1}], {unique: true})
        .then(() => ds.fetch(navTableName))
        .then(function (foundNav) {
          if (Array.isArray(foundNav) && foundNav.length) {
            foundNav.forEach(function (nav) {
              if (nav.itemType === 'section') {
                sections[nav.code] = nav;
              } else {
                nodes[nav.code] = nav;
              }
            });
            Object.keys(nodes).forEach(code => { enrichNodes(nodes[code]); });
            Object.keys(sections).forEach(code => { enrichNodes(sections[code]); });
          }
          resolve();
        })
        .catch(reject);
    });
  };

  /**
   *
   * @param {String} code
   * @return {{} | null}
   * @private
   */
  this._getNode = function (code) {
    if (nodes.hasOwnProperty(code)) {
      return nodes[code];
    }
    return null;
  };

  /**
   *
   * @return {Object[]}
   * @private
   */
  this._getNavigationSections = function () {
    var result = [];
    for (let nm in sections) {
      if (sections.hasOwnProperty(nm)) {
        result.push(sections[nm]);
      }
    }
    return result;
  };

  /**
   * @param {String} code
   * @returns {Object | null}
   * @private
   */
  this._getNavigationSection = function (code) {
    if (sections.hasOwnProperty(code)) {
      return sections[code];
    }
    return null;
  };
}

DsPortalMetaRepository.prototype = new PortalMetaRepository();

module.exports = DsPortalMetaRepository;
