/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/12/17.
 */
'use strict';

function PortalMetaRepository() {

  /**
   *
   * @return {Promise}
   */
  this.init = function () {
    return this._init();
  };

  /**
   * @returns {Object[]}
   */
  this.getNavigationSections = function () {
    return this._getNavigationSections();
  };

  /**
   * @param {String} code
   * @returns {Object | null}
   */
  this.getNavigationSection = function (code) {
    return this._getNavigationSection(code);
  };

  /**
   * @param {String} code
   * @returns {Object | null}
   */
  this.getNode = function (code) {
    return this._getNode(code);
  };

}

module.exports = PortalMetaRepository;
