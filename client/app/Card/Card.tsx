import classnames from 'classnames';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ICard } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { Icon } from '../Icon';
import './Card.scss';

type CardProps = {
  card: ICard,
  onClick: React.MouseEventHandler
}

export function Card({ card, onClick }: CardProps): JSX.Element {
  const { cardService } = useContext(DepsContext);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Flag for not opening the options immediately after losing focus and clicking on the options button again
  const [didOptionsCloseOnBlur, setDidOptionsCloseOnBlur] = useState(false);

  const optionsContainer = useRef<HTMLDivElement | null>(null);

  // Toggles options open if not coming from blur, otherwise clears the flag
  function handleClickOptions(event: React.MouseEvent) {
    event.stopPropagation();
    if (!didOptionsCloseOnBlur) {
      setIsOptionsOpen(!isOptionsOpen);
    } else {
      setDidOptionsCloseOnBlur(false);
    }
  }
 
  function handleOptionsContainerBlur() {
    setIsOptionsOpen(false);
    setDidOptionsCloseOnBlur(true);

    // Clear flag after a safe delay after handleClickOptions
    setTimeout(() => {
      setDidOptionsCloseOnBlur(false);
    }, 300);
  }

  function handleClickRemove() {
  }

  useEffect(() => {
    if (optionsContainer.current == null) { return; }

    if (isOptionsOpen) {
      optionsContainer.current.focus();
    }
  }, [isOptionsOpen]);

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
      <div className={optionsContainerClassNames} ref={optionsContainer} onBlur={handleOptionsContainerBlur} tabIndex={0} onClick={e => e.stopPropagation()}>
        <div className="options-highlight" />
        <span className="option-item"><Icon name="gg-duplicate" />Copy</span>
        <span className="option-item remove" onClick={handleClickRemove}><Icon name="gg-trash" />Remove</span>
      </div>
    </div>
  );
}