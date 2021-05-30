import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { IPopulatedList } from '../../../shared/data-types';
import { Icon } from '../Icon';
import './List.scss';
import { Card } from '../Card';
import { DepsContext } from '../App';
import { useRefTextArea } from '../hooks/input-utils';

type ListProps = {
  list: IPopulatedList
  listsCount: number
};

export function List({ list, listsCount }: ListProps): JSX.Element {
  const history = useHistory();
  const { cardService, listService, boardStore } = useContext(DepsContext);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isMoveActionOpen, setIsMoveActionOpen] = useState(false);
  const moveActionRef = useRef<HTMLDivElement>(null);
  const [moveTarget, setMoveTarget] = useState(list.position);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cards, setCards] = useState<JSX.Element[]>([]);

  const titleRef = useRefTextArea(
    updateListTitle
  );

  const addCardRef = useRefTextArea(
    function enterHandler() {
      addCard();
      setIsAddingCard(false);
    },
    function escapeHandler() {
      setIsAddingCard(false);
    }
  );

  function handleClickAddCard() {
    setIsAddingCard(true);
  }

  async function handleClickRemove() {
    setIsOptionsOpen(false);

    try {
      await listService.delete(list.id);
      boardStore.removeList(list.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleClickMove() {
    setIsOptionsOpen(false);
    setIsMoveActionOpen(true);
  }

  async function handleConfirmMove() {
    setIsMoveActionOpen(false);
    if (moveTarget == list.position) { return; }

    try {
      const updatedLists = await listService.move(list.id, moveTarget);
      boardStore.updateLists(updatedLists);
    } catch (error) {
      console.log(error);
    }
  }

  async function addCard() {
    const title = addCardRef.value.trim();
    if (title == '') { return; }

    try {
      const card = await cardService.add(title, list.id);
      boardStore.addCard(card);
      setIsAddingCard(false);
    } catch (error) {
      console.log(error);
    }
  }

  async function updateListTitle() {
    // Guard title empty or value unchanged
    const title = titleRef.value.trim();
    if (title == '' || titleRef.value == titleRef.preEditValue) { 
      titleRef.setValue(titleRef.preEditValue);
      return;
    }
  
    try {
      const updatedList = await listService.update(list.id, title);
      boardStore.updateList(updatedList);
    } catch (error) {
      console.log(error);
    }
  }

  // Update text area based on isAddingCard
  useEffect(() => {
    const textArea = addCardRef.domProps.ref.current;

    if (isAddingCard) {
      textArea && textArea.focus();
    } else {
      addCardRef.setValue('');
    }
  }, [isAddingCard, addCardRef]);

  // Create cards components from list
  useEffect(() => {
    setCards(list.cards.map(card => <Card key={card.id} card={card} onClick={() => history.push(`/card/${card.id}`)} />));
    titleRef.setValue(list.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  useEffect(() => {
    function handleClick(event: Event) {
      if (moveActionRef.current && !moveActionRef.current.contains(event.target as Node)) {
        setIsMoveActionOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => { document.addEventListener('mousedown', handleClick); }
  }, [moveActionRef]);

  const optionsContainerClassNames = classnames({
    'list-options-container': true,
    'is-active': isOptionsOpen
  });

  const addCardClassNames = classnames({
    card: true,
    'add-card': true,
    'adding-card': isAddingCard
  });

  const moveActionContainerClassNames = classnames({
    'move-action-container': true,
    'is-active': isMoveActionOpen
  });
  
  return (
    <div className="list">
      <div className="header">
        <div className="info-wrapper">
          <textarea { ...titleRef.domProps } className="title" />
          <Icon name="gg-math-plus" onClick={handleClickAddCard} />
          <Icon name="gg-more-alt" onClick={() => setIsOptionsOpen(!isOptionsOpen)} />
          <div className={optionsContainerClassNames}>
            {/* <div className="options-highlight" /> */}
            <div className="option-item" onClick={handleClickMove}>
              <Icon name="gg-move-right" />
              <span>Move</span>
            </div>
            <div className="option-item" onClick={handleClickRemove}>
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
          </div>
          <div className={moveActionContainerClassNames} ref={moveActionRef}>
            <div className="action-title">Move List</div>
            <div className="select-container">
              <span className="action-option">Position: {moveTarget}</span>
              <select value={moveTarget} onChange={e => setMoveTarget(Number(e.target.value))}>
                {Array.from(Array(listsCount).keys()).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <Icon name="gg-check-o" className="confirm-icon" onClick={handleConfirmMove} />
          </div>
        </div>
        <div className="list-underline" />
      </div>
      <div className="cards">
        <div className={addCardClassNames}>
          <textarea placeholder="Enter card title..." { ...addCardRef.domProps } />
        </div>
        {cards}
      </div>
    </div>
  );
}