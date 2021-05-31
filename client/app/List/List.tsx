import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { IPopulatedList } from '../../../shared/data-types';
import { Icon } from '../Icon';
import { Card } from '../Card';
import { DepsContext } from '../App';
import { useRefTextArea } from '../hooks/input-hooks';
import { useHiddenContainer } from '../hooks/common-hooks';
import './List.scss';

type ListProps = {
  list: IPopulatedList
  listsCount: number,
  filter: string
};

export function List({ list, listsCount, filter }: ListProps): JSX.Element {
  const history = useHistory();
  const { cardService, listService, boardStore } = useContext(DepsContext);

  const optionsContainer = useHiddenContainer<HTMLDivElement, HTMLSpanElement>();
  const moveActionContainer = useHiddenContainer<HTMLDivElement, HTMLDivElement>();

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

  async function handleClickRemove() {
    try {
      const updatedLists = await listService.delete(list.id);
      console.log(updatedLists);
      boardStore.updateLists(updatedLists);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleConfirmMove() {
    moveActionContainer.setIsOpen(false);
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
    const cardComponents = list.cards.filter(card => {
      return card.title.includes(filter);
    }).map(card => {
      return <Card key={card.id} card={card} onClick={() => history.push(`/card/${card.id}`)} />
    });

    setCards(cardComponents);
    titleRef.setValue(list.title);
    setMoveTarget(list.position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, filter]);

  const optionsContainerClassNames = classnames({
    'list-options-container': true,
    'is-active': optionsContainer.isOpen
  });

  const addCardClassNames = classnames({
    card: true,
    'add-card': true,
    'adding-card': isAddingCard
  });

  const moveActionContainerClassNames = classnames({
    'move-action-container': true,
    'is-active': moveActionContainer.isOpen
  });
  
  return (
    <div className="list">
      <div className="header">
        <div className="info-wrapper">
          <textarea { ...titleRef.domProps } className="title" />
          <Icon name="gg-math-plus" onClick={() => setIsAddingCard(true)} />
          <Icon name="gg-more-alt" ref={optionsContainer.btnRef} />
          <div className={optionsContainerClassNames} ref={optionsContainer.containerRef}>
            {/* <div className="options-highlight" /> */}
            <div className="option-item" ref={moveActionContainer.btnRef} onClick={() => optionsContainer.setIsOpen(false)}>
              <Icon name="gg-move-right" />
              <span>Move</span>
            </div>
            <div className="option-item remove" onClick={handleClickRemove}>
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
          </div>
          <div className={moveActionContainerClassNames} ref={moveActionContainer.containerRef}>
            <div className="action-title">Move List</div>
            <div className="select-container">
              <span className="action-option">Position: {moveTarget}</span>
              <select value={moveTarget} onChange={e => setMoveTarget(Number(e.target.value))}>
                {Array.from(Array(listsCount).keys()).map(p => {
                  const optionText = `${p}${list.position == p ? ' (current)' : ''}`;
                  return <option key={p} value={p}>{optionText}</option>;
                })}
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