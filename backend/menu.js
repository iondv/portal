/**
 * Created by Vasiliy Ermilov (ermilov.work@yandex.ru) on 2/13/17.
 */
'use strict';

/* jshint maxcomplexity: 25, maxstatements: 50 */
/**
 * @param {Object[]} nodes
 * @returns {Array}
 */
function buildSubMenu(nodes) {
  var result = [];
  if (Array.isArray(nodes) && nodes.length) {
    nodes.forEach(function (node) {
      result.push({
        id: node.code,
        nodes: buildSubMenu(node.subNodes),
        hint: node.hint,
        caption: node.caption,
        url: node.url,
        orderNumber: node.order,
        code: node.code
      });
    });
    result.sort((a, b)=> {
      return (a.orderNumber || 0) - (b.orderNumber || 0);
    });
  }
  return result;
}

/**
 * @param {String} moduleName
 * @param {PortalMetaRepository} repo
 * @returns {Array}
 */
module.exports = function (moduleName, repo) {
  var sections;
  var result = [];

  sections = repo.getNavigationSections();
  Object.keys(sections).forEach(function (key) {
    result.push({
      id: sections[key].code,
      nodes: buildSubMenu(sections[key].subNodes),
      hint: sections[key].hint,
      caption: sections[key].caption,
      url: ''
    });
  });

  return result;
};
