import * as React from 'react';
import styled from 'styled-components';
import { BlockType, FocusMode } from '@blink-mind/core';
import { TopicContentWidget } from './components/topic-content-widget';
import { RootWidget } from './components/root-widget';
import { TopicWidget } from './components/topic-widget';
import { TopicContextMenu } from './components/topic-context-menu';
import { TopicCollapseIcon } from './components/topic-collapse-icon';
import { StyleEditor } from './components/style-editor/style-editor';
import { TopicSubLinks } from './components/topic-sub-links';
import { RootSubLinks } from './components/root-sublinks';
import { linksRefKey } from '../../utils';
import { TopicHighlight } from './components/topic-highlight';
import { SaveRef } from '../../components/common';
import { MindDragScrollWidget } from './components/mind-drag-scroll-widget';
import { Modals } from './components/modals';
import { TopicDescIcon } from './components/topic-desc-icon';
import { SimpleTopicContentEditor } from './components/simple-topic-content-editor';
import { ModalBody, ModalDescEditor } from './components/modal-body';
import { SimpleTopicDescEditor } from './components/simple-topic-desc-editor';
import Theme from './theme';
import { customizeTopicContextMenu } from './context-menus';
import debug from 'debug';
const log = debug('plugin:rendering');

export function RenderingPlugin() {
  const DiagramRoot = styled.div`
    width: 100%;
    height: 100%;
    background: ${props => props.theme.background};
    position: relative;
  `;
  return {
    renderDiagram(props) {
      const { model, controller } = props;
      return (
        <SaveRef>
          {(saveRef, getRef) => {
            const widgetProps = {
              ...props,
              saveRef,
              getRef
            };
            log('renderDiagram', model);
            return (
              <Theme theme={model.config.theme}>
                <DiagramRoot>
                  <MindDragScrollWidget {...widgetProps} />
                  {controller.run('renderDiagramCustomize', widgetProps)}
                </DiagramRoot>
              </Theme>
            );
          }}
        </SaveRef>
      );
    },

    renderDiagramCustomize(props) {
      const { controller, model } = props;
      const styleEditor = controller.run('renderStyleEditor', {
        ...props,
        topicKey: model.focusKey
      });
      const modals = controller.run('renderModals', {
        ...props,
        topicKey: model.focusKey
      });
      return [styleEditor, modals];
    },

    renderModals(props) {
      return <Modals key="modals" {...props} />;
    },

    renderModal(props) {
      const { controller, model } = props;
      const activeModalProps = controller.run('getActiveModalProps', props);
      if (activeModalProps) {
        if (activeModalProps.name === 'edit-desc') {
          const modalProps = { ...props, topicKey: model.focusKey };
          return (
            <ModalBody>
              <ModalDescEditor>
                {controller.run('renderTopicDescEditor', modalProps)}
              </ModalDescEditor>
            </ModalBody>
          );
        }
      }
      return null;
    },

    getActiveModalProps(props) {
      const { model } = props;
      if (model.focusKey && model.focusMode === FocusMode.EDITING_DESC)
        return {
          name: 'edit-desc',
          title: 'Edit Notes',
          style: {
            width: '50%',
            height: '600px'
          }
        };
      return null;
    },

    renderDoc({ children }) {
      return children;
    },

    renderRootWidget(props) {
      return <RootWidget {...props} />;
    },

    renderTopicWidget(props) {
      return <TopicWidget {...props} />;
    },

    renderTopicContent(props) {
      return <TopicContentWidget {...props} />;
    },

    renderTopicContextMenu(props) {
      return <TopicContextMenu {...props} />;
    },

    customizeTopicContextMenu,

    renderTopicContentEditor(props) {
      log('renderTopicContentEditor', props);
      // return <TopicContentEditor {...props} />;
      return <SimpleTopicContentEditor {...props} />;
    },

    renderTopicDescEditor(props) {
      return <SimpleTopicDescEditor {...props} />;
    },

    renderTopicCollapseIcon(props) {
      return <TopicCollapseIcon {...props} />;
    },

    renderBlocks(props) {
      const { model, topicKey, controller } = props;
      const topic = model.getTopic(topicKey);
      const blocks = topic.blocks;
      const res = [];
      let i = 0;
      blocks.forEach(block => {
        const b = controller.run('renderBlock', {
          ...props,
          block,
          blockKey: `block-${i}`
        });
        if (b) {
          res.push(<React.Fragment key={`block-${i}`}>{b}</React.Fragment>);
          i++;
        }
      });
      return res;
    },

    renderBlock(props) {
      const { controller, block } = props;
      switch (block.type) {
        case BlockType.CONTENT:
          return controller.run('renderTopicContentEditor', props);
        case BlockType.DESC:
          return <TopicDescIcon {...props} />;
        default:
          break;
      }
      return null;
    },

    renderSubLinks(props) {
      const { saveRef, topicKey, model } = props;
      const topic = model.getTopic(topicKey);
      if (topic.subKeys.size === 0 || topic.collapse) return null;
      return <TopicSubLinks ref={saveRef(linksRefKey(topicKey))} {...props} />;
    },

    renderRootSubLinks(props) {
      const { saveRef, topicKey, model } = props;
      const topic = model.getTopic(topicKey);
      if (topic.subKeys.size === 0) return null;
      return <RootSubLinks ref={saveRef(linksRefKey(topicKey))} {...props} />;
    },

    renderFocusItemHighlight(props) {
      const { saveRef } = props;
      return <TopicHighlight ref={saveRef('focus-highlight')} {...props} />;
    },

    renderRootWidgetOtherChildren(props) {
      const { controller } = props;
      return (
        <>
          {controller.run('renderRootSubLinks', props)}
          {controller.run('renderFocusItemHighlight', props)}
          {controller.run('renderDragAndDropEffect', props)}
        </>
      );
    },

    renderStyleEditor(props) {
      return <StyleEditor key="style-editor" {...props} />;
    }
  };
}
