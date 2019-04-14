/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

/**
 */
function Resource() {

  /**
   * @returns {String}
   */
  this.getId = function () {
    return this._id();
  };

  /**
   * @returns {String}
   */
  this.getTitle = function () {
    return this._title();
  };

  /**
   * @returns {Date | null}
   */
  this.getDate = function () {
    return this._date();
  };

  /**
   * @returns {String}
   */
  this.getContent = function () {
    return this._content();
  };
}

module.exports = Resource;
