/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/12/17.
 */
'use strict';

const { di } = require('@iondv/core');
const {onError} = require('../../backend/error');
const {t} = require('@iondv/i18n');

module.exports = function (req, res) {
  /**
   * @type {{portalMeta: PortalMetaRepository}}
   */
  var scope = di.context(req.moduleName);
  if (!scope.portalMeta) {
    return onError(scope, new Error(t('Meta model repository not set up.')), res);
  }

  var defaultPath = scope.settings.get(req.moduleName + '.default');
  if (!defaultPath) {
    let sects = scope.portalMeta.getNavigationSections();
    for (let i = 0; i < sects.length; i++) {
      if (sects[i].subNodes && sects[i].subNodes.length) {
        defaultPath = sects[i].subNodes[0].code;
        break;
      }
    }
  }

  if (!defaultPath) {
    return  onError(scope, null, res, 404);
  }

  res.redirect('/' + req.moduleName + '/' + defaultPath);
};
