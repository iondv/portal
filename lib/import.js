/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

const path = require('path');
const { di, system: { toAbsolute } } = require('@iondv/core');
const { t } = require('@iondv/i18n');
const { FunctionCodes: F } = require('@iondv/meta-model-contracts');
const { log: { IonLogger } } = require('@iondv/commons');
const extend = require('extend');
const fs = require('fs');

let config_file = process.env.ION_CONFIG_PATH || 'config';

config_file = path.isAbsolute(config_file)
  ? config_file
  : path.normalize(path.join(process.cwd(), config_file));

const config = fs.existsSync(config_file) ? require(config_file) : {};

const module_config = require('../config');

const { format } = require('util');

const sysLog = new IonLogger(config.log || {});

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

module.exports = function (src, moduleName, namespace) {
  return new Promise(function (resolve, reject) {
    di(
      'boot',
      extend(
        true,
        {
          settings: {
            module: '@iondv/commons/lib/settings/SettingsRepository',
            initMethod: 'init',
            initLevel: 1,
            options: {
              logger: 'ion://sysLog'
            }
          }
        },
        config.bootstrap || {}
      ),
      { sysLog }
    ).then(scope =>
      di(
        'app',
        extend(
          true,
          config.di,
          module_config.di,
          scope.settings.get('plugins') || {},
          scope.settings.get(`${moduleName}.di`) || {}
        ),
        {},
        'boot',
        ['portalMeta'],
        ['application']
      )
    ).then(
      (scope) => {
        src = toAbsolute(src);
        info(scope.sysLog, format(t('Importing portal navigation meta model from %s'), src));
        return navigationLoader(src, scope.portalMeta.dataSource, scope.sysLog)
          .then(resolve).catch(reject);
      }
    ).catch(reject);
  });
};
