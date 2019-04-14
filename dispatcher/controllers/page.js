/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */

const di = require('core/di');
const moduleName = require('../../module-name');
const {
  navTemplate, resTemplate
} = require('../../backend/template');
const {onError} = require('../../backend/error');
const buildMenu = require('../../backend/menu');

module.exports = function(req, res) {
  /**
   * @type {{portalMeta: PortalMetaRepository, provider: ResourceProvider}}
   */
  const scope = di.context(moduleName);
  const n = scope.portalMeta.getNode(req.params.node);

  if (!n) {
    return onError(scope, null, res, 404);
  }
  const count = n.pageSize || 10;
  let offset = 0;
  if (req.query && req.query.p) {
    offset = (req.query.p - 1) * count;
  }

  if (n.resources) {
    if (n.id) {
      scope.provider.getResource(n.resources, n.id)
        .then((r) => {
          const customTemplate = resTemplate(n.resources, scope.settings.get('portal.pageTemplates'));
          res.render(customTemplate || 'resource', {
            resource: r,
            portal: scope.settings.get('portal.portalName'),
            module: moduleName,
            menu: buildMenu(moduleName, scope.portalMeta),
            query: req.query || {}
          });
        })
        .catch((err) => onError(scope, err, res));
      return;
    }

    scope.provider.getResources(n.resources, req.query, offset, count).then((resources) => {
      const customTemplate = navTemplate(n.code, scope.settings.get('portal.pageTemplates'));
      res.render(customTemplate || 'page', {
        resources,
        node: n,
        page: req.query.p || 1,
        pageCount: Math.ceil(resources.total / count),
        portal: scope.settings.get('portal.portalName'),
        module: moduleName,
        menu: buildMenu(moduleName, scope.portalMeta),
        query: req.query || {}
      }, (err, html) => {
        if (err) {
          onError(scope, err, res);
        }
        res.send(html);
      });
    })
      .catch((err) => onError(scope, err, res));
    return;
  }

  const customTemplate = navTemplate(n.code, scope.settings.get('portal.pageTemplates'));
  res.render(customTemplate || 'page', {
    resources: [],
    node: n,
    page: 1,
    pageCount: 0,
    portal: scope.settings.get('portal.portalName'),
    module: moduleName,
    menu: buildMenu(moduleName, scope.portalMeta),
    query: req.query || {}
  });
};
