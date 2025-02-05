import { Model } from '../model';
import { KeyType, TopicRelationship } from '../../types';

export function getAllSubTopicKeys(model: Model, topicKey: KeyType): KeyType[] {
  const item = model.getTopic(topicKey);

  let res = [];
  if (item.subKeys.size > 0) {
    const subKeys = item.subKeys.toArray();
    res.push(...subKeys);
    res = subKeys.reduce((acc, key) => {
      acc.push(...getAllSubTopicKeys(model, key));
      return acc;
    }, res);
  }
  return res;
}

export function getRelationship(
  model: Model,
  srcKey: KeyType,
  dstKey: KeyType
): string {
  const srcTopic = model.getTopic(srcKey);
  const dstTopic = model.getTopic(dstKey);
  if (srcTopic && dstTopic) {
    if (srcTopic.parentKey == dstTopic.parentKey)
      return TopicRelationship.SIBLING;
    let pTopic = srcTopic;
    while (pTopic.parentKey) {
      if (pTopic.parentKey === dstTopic.key)
        return TopicRelationship.DESCENDANT;
      pTopic = model.getParentTopic(pTopic.key);
    }
    pTopic = dstTopic;
    while (pTopic.parentKey) {
      if (pTopic.parentKey === srcTopic.key) return TopicRelationship.ANCESTOR;
      pTopic = model.getParentTopic(pTopic.key);
    }
  }
  return TopicRelationship.NONE;
}
