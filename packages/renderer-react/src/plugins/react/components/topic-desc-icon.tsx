import * as React from 'react';
import { iconClassName, IconName } from '../../../utils';
import { OpType } from '../../operation';
import { BlockType } from '@blink-mind/core';
import styled from 'styled-components';

const DescIcon = styled.div`
  &:hover {
  }
`;

export function TopicDescIcon(props) {
  const { controller, model, topicKey } = props;
  const onClick = e => {
    e.stopPropagation();
    controller.run('operation', {
      ...props,
      opType: OpType.START_EDITING_DESC
    });
  };
  const desc = model.getTopic(topicKey).getBlock(BlockType.DESC);
  return (
    desc.block && (
      <DescIcon
        onClick={onClick}
        className={iconClassName(IconName.NOTES)}
      ></DescIcon>
    )
  );
}
