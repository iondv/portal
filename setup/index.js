/**
 * Created by kras on 19.08.16.
 */
'use strict';

var importer = require('../lib/import');

/**
 * @returns {Promise}
 */
module.exports = function (config) {
  if (config.import) {
    return importer(config.import.src);
  }
  return Promise.resolve();
};
