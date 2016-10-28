'use strict';

require('./file');
require('./trial');
require('./source');

const _ = require('lodash');
const helpers = require('../helpers');
const bookshelf = require('../../config').bookshelf;
const BaseModel = require('./base');
const relatedModels = [
  'file',
  'trials',
  'source',
]

const Document = BaseModel.extend({
  tableName: 'documents',
  visible: [
    'id',
    'name',
    'type',
    'source_url',
    'file',
    'trials',
    'source',
  ],
  serialize: function (options) {
    const attributes = Object.assign(
      {},
      Object.getPrototypeOf(Document.prototype).serialize.call(this, arguments),
      {
        trials: this.related('trials').map((trial) => trial.toJSONSummary()),
      }
    );

    return attributes
  },
  file: function () {
    return this.belongsTo('File');
  },
  trials: function () {
    return this.belongsToMany('Trial', 'trials_documents');
  },
  source: function () {
    return this.belongsTo('Source');
  },
  toJSONSummary: function () {
    const isEmptyPlainObject = (value) => _.isPlainObject(value) && _.isEmpty(value);
    const isNilOrEmptyPlainObject = (value) => _.isNil(value) || isEmptyPlainObject(value)
    const attributes = Object.assign(
      this.toJSON(),
      {
        file: this.related('file').toJSONSummary(),
        trials: this.related('trials').map((t) => t.toJSONSummary()),
        source_id: this.attributes.source_id,
      }
    );

    delete attributes.source;

    return _.omitBy(attributes, isNilOrEmptyPlainObject);
  },
  virtuals: {
    url: function () {
      return helpers.urlFor(this);
    },
  },
}, {
  relatedModels,
});

module.exports = bookshelf.model('Document', Document);
