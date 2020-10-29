/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const di = require('core/di');
const config = require('../config');
const moduleName = require('../module-name');
const resolvePath = require('core/resolvePath');
const F = require('core/FunctionCodes');
const {t} = require('core/i18n');
const {format} = require('util');

/**
 * @param {Logger} log
 * @param {String} msg
 */
function info(log, msg) {
  if (log) {
    log.log(msg);
  } else {
    console.log(msg);
  }
}

/**
 * @param {Logger} log
 * @param {String} msg
 */
function warn(log, msg) {
  if (log) {
    log.warn(msg);
  } else {
    console.warn(msg);
  }
}

/**
 * @param {String} filePath
 * @param {DataSource} dataSource
 * @param {Logger} log
 * @returns {Promise}
 */
function nodeLoader(filePath, dataSource, log) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
      if (err) {
        return reject(new Error(format(t('Failed to read contents of file %s'), filePath)));
      }
      try {
        var n = JSON.parse(data);
        info(log, format(t('Portal navigation node %s is written to database.'), n.code));
        dataSource.upsert('ion_portal_nav', {[F.EQUAL]: ['$code', n.code]}, n).then(resolve).catch(reject);
      } catch (err) {
        reject(err);
      }
    });
  });
}

/**
 * @param {String} src
 * @param {DataSource} dataSource
 * @param {Logger} log
 * @returns {*}
 */
function navigationLoader(src, dataSource, log) {
  return new Promise(function (resolve, reject) {
    var d = path.join(src, 'navigation');
    fs.access(d, fs.R_OK, function (err) {
      if (!err) {
        fs.readdir(d, function (err, files) {
          var savers = [];
          for (var i = 0; i < files.length; i++) {
            savers.push(nodeLoader(path.join(d, files[i]), dataSource, log));
          }
          Promise.all(savers).then(resolve).catch(reject);
        });
      } else {
        warn(log, format(t('Failed to read directory of portal navigation meta model: %s'), src));
        resolve();
      }
    });
  });
}

module.exports = function (src) {
  return new Promise(function (resolve, reject) {
    di(
      moduleName,
      config.di,
      {},
      'app',
      [],
      'modules/' + moduleName
    ).then(
      function (scope) {
        var pth = resolvePath(src);
        info(scope.sysLog, format(t('Importing portal navigation meta model from %s'), pth));
        navigationLoader(pth, scope.portalMeta.dataSource, scope.sysLog)
          .then(resolve).catch(reject);
      }
    ).catch(reject);
  });
};
