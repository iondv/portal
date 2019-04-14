/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

const di = require('core/di');
const moduleName = require('../../module-name');
const {resTemplate} = require('../../backend/template');
const {onError} = require('../../backend/error');
const buildMenu = require('../../backend/menu');

module.exports = function (req, res) {
  /**
   * @type {{portalMeta: PortalMetaRepository, provider: ResourceProvider}}
   */
  var scope = di.context(moduleName);
  var n = scope.portalMeta.getNode(req.params.node);

  if (!n || !n.resources) {
    return onError(scope, null, res, 404);
  }

  scope.provider.getResource(n.resources, req.params.id)
    .then(function (resource) {
      if (!resource) {
        onError(scope, null, res, 404);
      }
      let customTemplate = resTemplate(n.resources, scope.settings.get('portal.pageTemplates'));
      res.render(customTemplate || 'resource', {
        resource: resource,
        portal: scope.settings.get('portal.portalName'),
        module: moduleName,
        menu: buildMenu(moduleName, scope.portalMeta)
      }, function (err, html) {
        if (err) {
          onError(scope, err, res);
        }
        res.send(html);
      });
    }).catch(err => onError(scope, err, res));
};
