import * as React from 'react';
import memoizeOne from 'memoize-one';
import { Hotkey, Hotkeys, HotkeysTarget } from '@blueprintjs/core';
import { Model, Controller, OnChangeFunction } from '@blink-mind/core';
import { DefaultPlugin } from '../plugins';
import './diagram.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import debug from 'debug';
const log = debug('node:Diagram');

interface Props {
  model: Model;
  onChange: OnChangeFunction;
  commands?: any;
  plugins?: any;
}

@HotkeysTarget
export class Diagram extends React.Component<Props> {
  controller: Controller;

  getDiagramProps() {
    return this.diagramProps;
  }

  diagramProps;

  resolveController = memoizeOne((plugins = [], commands, TheDefaultPlugin) => {
    const defaultPlugin = TheDefaultPlugin();
    this.controller = new Controller({
      plugins: [plugins, defaultPlugin],
      commands,
      construct: false,
      onChange: this.props.onChange
    });
    this.controller.run('onConstruct');
  });

  renderHotkeys() {
    log(`renderHotkeys`);
    const { controller } = this.diagramProps;
    const hotKeys = controller.run('customizeHotKeys', this.diagramProps);
    if (hotKeys === null) return null;
    if (!(hotKeys instanceof Map)) {
      throw new TypeError('customizeHotKeys must return a Map');
    }
    log(hotKeys);
    const children = [];
    hotKeys.forEach((v, k) => {
      log(k, v);
      children.push(<Hotkey key={k} {...v} global />);
    });
    return <Hotkeys>{children}</Hotkeys>;
  }

  render() {
    const { commands, plugins, model } = this.props;
    this.resolveController(plugins, commands, DefaultPlugin);
    this.diagramProps = {
      ...this.props,
      controller: this.controller,
      model,
      diagram: this
    };
    return this.controller.run('renderDiagram', this.diagramProps);
  }
}
