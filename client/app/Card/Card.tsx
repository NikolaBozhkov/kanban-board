import classnames from 'classnames';
import React, { useContext } from 'react';
import { ICard } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { useHiddenContainer } from '../hooks/common-hooks';
import { Icon } from '../Icon';
import './Card.scss';

type CardProps = {
  card: ICard,
  onClick: React.MouseEventHandler
}

export function Card({ card, onClick }: CardProps): JSX.Element {
  const { cardService, boardStore } = useContext(DepsContext);

  const optionsContainer = useHiddenContainer<HTMLDivElement, HTMLSpanElement>();

  async function handleClickRemove() {
    try {
      await cardService.delete(card.id);
      boardStore.removeCard(card.id);
    } catch (error) {
      console.log(error);
    }
  }

  const optionsIconClassNames = classnames({
    'is-active': optionsContainer.isOpen
  });

  const optionsContainerClassNames = classnames({
    'options-container': true,
    'is-active': optionsContainer.isOpen
  });

  return (
    <div className="card" onClick={onClick}>
      <span className="title">{card.title}</span>
      <div className="options">
        <Icon name="gg-more-vertical-alt" className={optionsIconClassNames} ref={optionsContainer.btnRef} onClick={e => e.stopPropagation()} />
        <div className="options-highlight" />
      </div>
      <div className={optionsContainerClassNames} ref={optionsContainer.containerRef} onClick={e => e.stopPropagation()}>
        <div className="options-highlight" />
        <span className="option-item"><Icon name="gg-move-right" />Move</span>
        <span className="option-item"><Icon name="gg-duplicate" />Copy</span>
        <span className="option-item remove" onClick={handleClickRemove}><Icon name="gg-trash" />Remove</span>
      </div>
    </div>
  );
}