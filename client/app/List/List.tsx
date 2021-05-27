import React, { useContext, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { IPopulatedList } from '../../../shared/data-types';
import { Icon } from '../Icon';
import './List.scss';
import { Card } from '../Card';
import { DepsContext } from '../App';

type ListProps = {
  list: IPopulatedList
};

export function List({ list }: ListProps): JSX.Element {
  const { cardService, listService, boardStore } = useContext(DepsContext);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const addCardTitleInput = useRef<HTMLInputElement | null>(null);

  function handleClickAddCard() {
    if (!isAddingCard) {
      setIsAddingCard(true);
    } else if (addCardTitleInput.current != null) {
      addCardTitleInput.current.focus();
    }
  }

  async function handleClickRemove() {
    try {
      await listService.delete(list.id);
      boardStore.removeList(list.id);
    } catch (error) {
      console.log(error);
    }
  }

  function handleCardTitleInputKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      addCard();
    } else if (event.key == 'Escape') {
      setIsAddingCard(false);
    }
  }

  function handleCardTitleInputBlur() {
    if (addCardTitleInput.current != null && addCardTitleInput.current.value != '') {
      addCard();
    } else {
      setIsAddingCard(false);
    }
  }

  async function addCard() {
    if (addCardTitleInput.current == null) {  return; }

    const title = addCardTitleInput.current.value;
    if (title == '') { return; }

    try {
      const card = await cardService.add(title, list.id);
      boardStore.addCard(card);
      setIsAddingCard(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (addCardTitleInput.current == null) { return; }
    if (isAddingCard) {
      addCardTitleInput.current.focus();
    } else {
      addCardTitleInput.current.value = '';
    }
  }, [isAddingCard]);

  const actionsClassNames = classnames({
    actions: true,
    'actions-open': isActionsOpen
  });

  const addCardClassNames = classnames({
    card: true,
    'add-card': true,
    'adding-card': isAddingCard
  });

  const cards = list.cards.map(card => <Card {...card} key={card.id} />);
  
  return (
    <div className="list">
      <div className="header">
        <div className="info-wrapper">
          <span className="title">{list.title}</span>
          <Icon name="gg-math-plus" onClick={handleClickAddCard} />
          <Icon name="gg-more-alt" onClick={() => setIsActionsOpen(!isActionsOpen)} />
          <div className={actionsClassNames}>
            <div className="action" onClick={handleClickRemove}>
              <Icon name="gg-trash" />
              <span>Remove</span>
            </div>
          </div>
        </div>
        <div className="list-underline" />
      </div>
      <div className="cards">
        <div className={addCardClassNames}>
          <input type="text" placeholder="Enter card title..." ref={addCardTitleInput} onKeyDown={handleCardTitleInputKeyDown} onBlur={handleCardTitleInputBlur} />
        </div>
        {cards}
      </div>
    </div>
  );
}