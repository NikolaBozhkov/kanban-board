import classnames from 'classnames';
import React, { useContext, useEffect, useState, MouseEvent } from 'react';
import { ICard, IList, IPopulatedList } from '../../../shared/data-types';
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
  const [lists, setLists] = useState<IPopulatedList[]>([]);

  const optionsContainer = useHiddenContainer<HTMLDivElement, HTMLSpanElement>();
  const moveActionContainer = useHiddenContainer<HTMLDivElement, HTMLSpanElement>();
  const [moveListTarget, setMoveListTarget] = useState<IPopulatedList>();
  const [moveListId, setMoveListId] = useState(card.listId);
  const [moveTarget, setMoveTarget] = useState(0);

  async function handleClickRemove() {
    try {
      await cardService.delete(card.id);
      boardStore.removeCard(card.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleConfirmMove() {
    moveActionContainer.setIsOpen(false);
    if (moveListId == card.listId && moveTarget == card.position) { return; }

    try {
      const updatedLists = await cardService.move(card.id, moveListId, moveTarget);
      boardStore.setLists(updatedLists);
    } catch (error) {
      console.log(error);
    }
  }

  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    if (optionsContainer.btnRef.current?.contains(event.target as Node)
    || optionsContainer.containerRef.current?.contains(event.target as Node)
    || moveActionContainer.containerRef.current?.contains(event.target as Node)) {
      return;
    }

    onClick(event);
  }

  function openMoveAction() {
    optionsContainer.setIsOpen(false);
    moveActionContainer.setIsOpen(true);
  }

  useEffect(() => {
    const unsubscribeLists = boardStore.subscribeToPopulatedLists(lists => {
      setLists(lists);
    });

    setLists(boardStore.getPopulatedLists());

    return () => unsubscribeLists();
  }, [boardStore]);

  useEffect(() => {
    const list = lists.find(list => list.id == moveListId);

    if (list) {
      setMoveListTarget(list);
      setMoveTarget(list.id == card.listId ? card.position : 0);
    }
  }, [lists, moveListId, card]);

  const optionsIconClassNames = classnames({
    'is-active': optionsContainer.isOpen || moveActionContainer.isOpen
  });

  const optionsContainerClassNames = classnames({
    'options-container': true,
    'is-active': optionsContainer.isOpen
  });

  const moveActionContainerClassNames = classnames({
    'move-action-container': true,
    'is-active': moveActionContainer.isOpen
  });

  return (
    <div className="card" onClick={handleCardClick}>
      <span className="title">{card.title}</span>
      <div className="options">
        <Icon name="gg-more-vertical-alt" className={optionsIconClassNames} ref={optionsContainer.btnRef} />
        <div className="options-highlight" />
      </div>
      <div className={optionsContainerClassNames} ref={optionsContainer.containerRef}>
        <div className="options-highlight" />
        <span className="option-item" onClick={openMoveAction}><Icon name="gg-move-right" />Move</span>
        <span className="option-item"><Icon name="gg-duplicate" />Copy</span>
        <span className="option-item remove" onClick={handleClickRemove}><Icon name="gg-trash" />Remove</span>
      </div>
      <div className={moveActionContainerClassNames} ref={moveActionContainer.containerRef}>
        <div className="action-title">Move Card</div>
        <div className="select-container">
          <span className="action-option">List: {moveListTarget?.title}</span>
          <select value={moveListId} onChange={e => setMoveListId(e.target.value)} onClick={e => console.log(lists)}>
            {lists.map(list => {
              const optionText = `${list.title}${card.listId == list.id ? ' (current)' : ''}`;
              return <option key={list.id} value={list.id}>{optionText}</option>;
            })}
          </select>
        </div>
        <div className="select-container">
          <span className="action-option">Position: {moveTarget}</span>
          <select value={moveTarget} onChange={e => setMoveTarget(Number(e.target.value))}>
            {moveListTarget && Array.from(Array(moveListTarget.cards.length).keys()).map(p => {
              const optionText = `${p}${card.listId == moveListTarget.id && p == card.position ? ' (current)' : ''}`;
              return <option key={p} value={p}>{optionText}</option>;
            })}
          </select>
        </div>
        <Icon name="gg-check-o" className="confirm-icon" onClick={handleConfirmMove} />
      </div>
    </div>
  );
}