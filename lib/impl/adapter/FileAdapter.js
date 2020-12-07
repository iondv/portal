/**
 * Created by krasilneg on 25.02.17.
 */
'use strict';
const ResourceAdapter = require('../../interfaces/ResourceAdapter');
const Resource = require('../../interfaces/Resource');
const resolvePath = require('core/resolvePath');
const path = require('path');
const fs = require('fs');
const showdown = require('showdown');
const {t} = require('core/i18n');
const {format} = require('util');

/**
 *
 * @param {{}} options
 * @param {String} options.dir
 * @constructor
 */
function FileAdapter(options) {

  if (!options.dir) {
    throw new Error(t('FileAdapter: contents directory is not set up.'));
  }

  var converter = null;
  if (options.type) {
    converter = new showdown.Converter();
  }

  /**
   * @param {String} name
   * @param {Date} date
   * @param {String} content
   * @constructor
   */
  function FileResource(name, date, content) {
    var _title = '';

    var _content = content;

    if (options.type === 'markdown') {
      _title = content.match(/^\s*#+\s+[^\s].*$/m);
      if (!_title) {
        let pos = content.search(/^=+$/m);
        if (pos > 0) {
          _title = content.substring(content.lastIndexOf('\n', pos - 2) + 1, pos);
        }
      }
    } else {
      _title = content.match(/<h\d>[^<>]+<\/h\d>/m);
      if (_title) {
        _title = _title[0].replace(/<\/?h\d>/g, '');
      }
    }
    _title = _title || '';

    if (options.type === 'markdown' && converter) {
      _content = converter.makeHtml(_content);
    }

    /**
     * @returns {String}
     */
    this._id = function () {
      return name;
    };

    /**
     * @returns {String}
     */
    this._title = function () {
      return _title;
    };

    /**
     * @returns {Date | null}
     */
    this._date = function () {
      return date;
    };

    /**
     * @returns {String}
     */
    this._content = function () {
      return _content;
    };
  }

  FileResource.prototype = new Resource();

  var resById = {};
  var resources = [];

  function loader(fn, prefix) {
    return function () {
      return new Promise(function (resolve, reject) {
        fs.stat(fn, function (err, stats) {
          if (err) {
            return reject(err);
          }

          var id = path.basename(fn);
          id = (prefix ? prefix + '/' : '') + id;
          if (stats.isDirectory()) {
            return loadDir(fn, id).then(resolve).catch(reject);
          }

          fs.readFile(fn, {encoding: 'utf-8'}, function (err, data) {
            if (err) {
              if (options.log) {
                options.log.warn(format(t('Failed to load resource file %s. The reason is:'), fn));
                options.log.error(err);
              }
              return resolve();
            }

            var res = new FileResource(id, stats.mtime, data);
            resById[res.getId()] = res;
            resources.push(res);
            resolve();
          });
        });
      });
    };
  }

  function loadDir(pth, prefix) {
    if (options.log) {
      options.log.info(format(t('Content is loading from %s'), pth));
    }
    return new Promise(function (resolve, reject) {
      try {
        fs.readdir(pth, function (err, names) {
          if (err) {
            return reject(err);
          }

          var l = null;
          names.forEach(function (filename) {
            if (l) {
              l = l.then(loader(path.join(pth, filename), prefix));
            } else {
              l = loader(path.join(pth, filename), prefix)();
            }
          });
          if (l) {
            return l.then(resolve).catch(reject);
          }
          resolve();
        });
      } catch (err) {
        return Promise.reject(err);
      }
    });
  }

  this.init = function () {
    return loadDir(resolvePath(options.dir), '');
  };

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
    var start = offset || 0;
    var end = count ? start + count : resources.length - 1;
    return Promise.resolve(resources.slice(start, end));
  };

  /**
   *
   * @param {String} id
   * @return {Promise.<Resource>}
   */
  this._getResource = function (id) {
    if (resById.hasOwnProperty(id)) {
      return Promise.resolve(resById[id]);
    }
    return Promise.resolve(null);
  };
}

FileAdapter.prototype = new ResourceAdapter();
module.exports = FileAdapter;
