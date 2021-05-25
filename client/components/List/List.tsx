import React, { useEffect, useState } from 'react';
import classnames from 'classnames';
import { IList } from '../../../shared/data-types';
import Icon from '../Icon';
import './List.scss';

type ListProps = {
  list: IList,
  onRemove: (listId: string) => void
};

export function List({ list, onRemove }: ListProps): JSX.Element {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const actionsClassNames = classnames({
    actions: true,
    'actions-open': isActionsOpen
  });
  
  return (
    <div className="list">
      <div className="header">
        <div className="info-wrapper">
          <span className="title">{list.title}</span>
          <Icon name="gg-more-alt" className="actions-icon" onClick={() => setIsActionsOpen(!isActionsOpen)} />
          <div className={actionsClassNames}>
            <div className="action" onClick={() => onRemove(list.id)}>
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
            <div className="action">
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
            <div className="action">
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
          </div>
        </div>
        <div className="list-underline" />
      </div>
    </div>
  );
}