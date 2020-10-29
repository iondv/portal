/* eslint new-cap:off, no-multi-assign:off */

/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/9/17.
 */
'use strict';

const express = require('express');
const di = require('core/di');
const config = require('./config');
const moduleName = require('./module-name');
const dispatcher = require('./dispatcher');
const extendDi = require('core/extendModuleDi');
const ejsLocals = require('ejs-locals');
const theme = require('lib/util/theme');
const staticRouter = require('lib/util/staticRouter');
const extViews = require('lib/util/extViews');
const alias = require('core/scope-alias');
const merge = require('merge');
const isProduction = process.env.NODE_ENV === 'production';
const isDevelop = process.env.NODE_ENV === 'development';
const {load} = require('core/i18n');

var app = module.exports = express();
var router = express.Router();

router.get('/', dispatcher.index);
router.get('/:node', dispatcher.page);
router.get('/:node/:id(([^/]+/?[^/]+)*)', dispatcher.resource);

app.locals.sysTitle = config.sysTitle;
app.locals.staticsSuffix = process.env.ION_ENV === 'production' ? '.min' : '';
app.locals.module = moduleName;
app.locals.lkModule = config.lkModule;

app.engine('ejs', ejsLocals);
app.set('view engine', 'ejs');

app._init = function () {
  let rootScope = di.context('app');
  let needAuth = rootScope.settings.get(moduleName + '.needAuth');
  if (!needAuth) {
    rootScope.auth.exclude('/' + moduleName + '/**');
    rootScope.auth.exclude('/' + moduleName);
  }

  return load(path.join(__dirname, 'i18n'))
    .then(
      di(
        moduleName,
        extendDi(moduleName, config.di),
        {module: app},
        'app',
        [],
        'modules/' + moduleName
      )
    )
    .then(scope => alias(scope, scope.settings.get(moduleName + '.di-alias')))
    .then((scope) => {
      let staticOptions = isDevelop ? {} : scope.settings.get('staticOptions');
      theme(
        app,
        moduleName,
        __dirname,
        scope.settings.get(moduleName + '.theme') ||
        config.theme || 'default',
        scope.sysLog,
        staticOptions
      );
      app.locals.pageTitle = scope.settings.get(moduleName + '.pageTitle')
        || scope.settings.get('pageTitle')
        || `ION ${config.sysTitle}`;
      extViews(app, scope.settings.get(moduleName + '.templates'));
      app.locals.pageEndContent = scope.settings.get(moduleName + '.pageEndContent') || scope.settings.get('pageEndContent') || '';
      let statics = staticRouter(scope.settings.get(`${moduleName}.statics`), staticOptions);
      if (statics) {
        app.use('/' + moduleName, statics);
      }
      scope.auth.bindAuth(app, moduleName, {});
      app.use('/' + moduleName, function (req, res, next) {
        res.locals.user = scope.auth.getUser(req);
        next();
      });
      merge(app.locals, scope.settings.get('portal.env') || {});
      app.use('/' + moduleName, router);
    });
};
