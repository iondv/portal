/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/17/17.
 */
'use strict';

const Logger = require('core/interfaces/Logger');
const moduleName = require('../module-name');
const buildMenu = require('./menu');
const {errTemplate} = require('./template');

module.exports.onError = function (scope, err, res, errorCode) {
  if (err) {
    if (scope && scope.sysLog && scope.sysLog instanceof Logger) {
      scope.sysLog.error(err);
    } else {
      console.error(err);
    }
  }

  let code = errorCode || 500;
  let customTemplate = errTemplate(code.toString(), scope.settings.get('portal.pageTemplates'));
  res.status(code).render(customTemplate || code.toString(), {
    portal: scope.settings.get('portal.portalName'),
    module: moduleName,
    menu: buildMenu(moduleName, scope.portalMeta)
  });
};

module.exports.onApiError = function (scope, err, res) {
  if (err) {
    scope.sysLog.error(err);
  }
  res.sendStatus(404);
};
