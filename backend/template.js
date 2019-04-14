/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/17/17.
 */
'use strict';

function findTemplate(id, map, type) {
  if (id && map && map[type]) {
    if (map[type][id]) {
      return map[type][id];
    }

    if (map[type]['*']) {
      return map[type]['*'];
    }
  }
  return null;
}

/**
 *
 * @param {String} navId
 * @param {{}} map
 * @return {String | null}
 */
module.exports.navTemplate = function (navId, map) {
  return findTemplate(navId, map, 'navigation');
};

/**
 *
 * @param {String} adapterId
 * @param {{}} map
 * @return {String | null}
 */
module.exports.resTemplate = function (adapterId, map) {
  return findTemplate(adapterId, map, 'resources');
};

/**
 *
 * @param {String} code
 * @param {{}} map
 * @return {String | null}
 */
module.exports.errTemplate = function (code, map) {
  return findTemplate(code, map, 'errors');
};
