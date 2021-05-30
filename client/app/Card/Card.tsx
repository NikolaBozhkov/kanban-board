import classnames from 'classnames';
import React, { useContext, useRef, useState } from 'react';
import { ICard } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { useOutsideClickHandler } from '../hooks/common-hooks';
import { Icon } from '../Icon';
import './Card.scss';

type CardProps = {
  card: ICard,
  onClick: React.MouseEventHandler
}

export function Card({ card, onClick }: CardProps): JSX.Element {
  const { cardService, boardStore } = useContext(DepsContext);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Flag for not opening the options immediately after closing by clicking on the options button again
  const [didOptionsJustClose, setdidOptionsJustClose] = useState(false);

  const optionsContainer = useRef<HTMLDivElement | null>(null);

  useOutsideClickHandler(() => {
    if (!isOptionsOpen) { return; }

    setIsOptionsOpen(false);
    setdidOptionsJustClose(true);

    // Clear flag after a safe delay after handleClickOptions
    setTimeout(() => {
      setdidOptionsJustClose(false);
    }, 300);
  }, optionsContainer);

  // Toggles options open if not coming from blur, otherwise clears the flag
  function handleClickOptions(event: React.MouseEvent) {
    event.stopPropagation();
    if (!didOptionsJustClose) {
      setIsOptionsOpen(true);
    } else {
      setdidOptionsJustClose(false);
    }
  }

  async function handleClickRemove() {
    try {
      await cardService.delete(card.id);
      boardStore.removeCard(card.id);
    } catch (error) {
      console.log(error);
    }
  }

  const optionsIconClassNames = classnames({
    'is-active': isOptionsOpen
  });

  const optionsContainerClassNames = classnames({
    'options-container': true,
    'is-active': isOptionsOpen
  });

  return (
    <div className="card" onClick={onClick}>
      <span className="title">{card.title}</span>
      <div className="options">
        <Icon name="gg-more-vertical-alt" className={optionsIconClassNames} onClick={handleClickOptions} />
        <div className="options-highlight" />
      </div>
      <div className={optionsContainerClassNames} ref={optionsContainer} onClick={e => e.stopPropagation()}>
        <div className="options-highlight" />
        <span className="option-item"><Icon name="gg-duplicate" />Copy</span>
        <span className="option-item remove" onClick={handleClickRemove}><Icon name="gg-trash" />Remove</span>
      </div>
    </div>
  );
}