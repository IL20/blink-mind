import { Map, Record } from 'immutable';
import isPlainObject from 'is-plain-object';
import { Data } from './data';
import { FocusMode, KeyType } from '../types';
import { Config } from './config';
import { Topic } from './topic';
import { createKey } from '../utils';

type ModelRecordType = {
  topics: Map<KeyType, Topic>;
  data?: Map<any, any>;
  config: Config;
  rootTopicKey: KeyType;
  editorRootTopicKey?: KeyType;
  focusKey?: KeyType;
  focusMode?: string;
};

const defaultModelRecord: ModelRecordType = {
  topics: Map(),
  data: null,
  config: null,
  rootTopicKey: null,
  editorRootTopicKey: null,
  focusKey: null,
  focusMode: null
};

export class Model extends Record(defaultModelRecord) {
  static isModel(obj) {
    return obj instanceof Model;
  }
  static create(attrs: any = null): Model {
    if (attrs == null) return Model.createEmpty();

    if (Model.isModel(attrs)) {
      return attrs;
    }

    if (isPlainObject(attrs)) {
      return Model.fromJSON(attrs);
    }

    throw new Error(
      `\`Value.create\` only accepts objects or values, but you passed it: ${attrs}`
    );
  }

  static createEmpty(): Model {
    const model = new Model();
    const rootTopic = Topic.create({ key: createKey() });
    return model
      .update('topics', topics => topics.set(rootTopic.key, rootTopic))
      .set('rootTopicKey', rootTopic.key);
  }

  static fromJSON(object) {
    let model = new Model();
    const { data = {}, topics = [], config = {}, rootTopicKey } = object;
    let { editorRootTopicKey } = object;

    if (editorRootTopicKey === undefined) editorRootTopicKey = rootTopicKey;

    model = model.merge({
      rootTopicKey,
      editorRootTopicKey
    });

    model = model.withMutations(model => {
      topics.forEach(topic => {
        model.update('topics', topics =>
          topics.set(topic.key, Topic.fromJSON(topic))
        );
      });
      model.set('config', Config.fromJSON(config));
      model.set('data', Data.fromJSON(data));
    });

    return model;
  }

  toJS() {
    const obj = {
      rootTopicKey: this.rootTopicKey,
      topics: Object.values(this.topics.toJS()),
      config: this.config,
      data: this.data
    };
    return obj;
  }

  get topics(): Map<KeyType, Topic> {
    return this.get('topics');
  }

  get config(): Config {
    return this.get('config');
  }

  get rootTopicKey(): KeyType {
    return this.get('rootTopicKey');
  }

  get editorRootTopicKey(): KeyType {
    return this.get('editorRootTopicKey');
  }

  get focusKey(): KeyType {
    return this.get('focusKey');
  }

  get focusMode(): KeyType {
    return this.get('focusMode');
  }

  get editingContentKey(): KeyType {
    return this.focusMode === FocusMode.EDITING_CONTENT ? this.focusKey : null;
  }

  get editingDescKey(): KeyType {
    return this.focusMode === FocusMode.EDITING_DESC ? this.focusKey : null;
  }

  getTopic(key: KeyType): Topic {
    return this.topics.get(key);
  }

  getParentTopic(key: KeyType): Topic {
    const topic = this.getTopic(key);
    return topic.parentKey ? this.getTopic(topic.parentKey) : null;
  }

  getTopicVisualLevel(key: KeyType): number {
    let topic = this.getTopic(key);
    let level = 0;
    while (topic && topic.key !== this.editorRootTopicKey) {
      level++;
      topic = this.getParentTopic(topic.key);
    }
    return level;
  }

  get rootTopic() {
    return this.getTopic(this.rootTopicKey);
  }
}
