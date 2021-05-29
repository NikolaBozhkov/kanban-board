import React, { useContext, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import { IPopulatedList } from '../../../shared/data-types';
import { Icon } from '../Icon';
import './List.scss';
import { Card } from '../Card';
import { DepsContext } from '../App';
import { useRefTextArea } from '../hooks/utility';

type ListProps = {
  list: IPopulatedList
};

export function List({ list }: ListProps): JSX.Element {
  const { cardService, listService, boardStore } = useContext(DepsContext);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cards, setCards] = useState<JSX.Element[]>([]);

  const addCardTextAreaRef = useRefTextArea(
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
    try {
      await listService.delete(list.id);
      boardStore.removeList(list.id);
    } catch (error) {
      console.log(error);
    }
  }

  async function addCard() {
    const title = addCardTextAreaRef.value;
    if (title == '') { return; }

    try {
      const card = await cardService.add(title, list.id);
      boardStore.addCard(card);
      setIsAddingCard(false);
    } catch (error) {
      console.log(error);
    }
  }

  // Update text area based on isAddingCard
  useEffect(() => {
    const textArea = addCardTextAreaRef.ref.current;

    if (isAddingCard) {
      textArea && textArea.focus();
    } else {
      addCardTextAreaRef.setValue('');
    }
  }, [isAddingCard, addCardTextAreaRef]);

  // Create cards components from list
  useEffect(() => {
    console.log(list.cards.map(c => c.id));
    setCards(list.cards.map(card => <Card {...card} key={card.id} />));
  }, [list]);

  const actionsClassNames = classnames({
    actions: true,
    'actions-open': isActionsOpen
  });

  const addCardClassNames = classnames({
    card: true,
    'add-card': true,
    'adding-card': isAddingCard
  });
  
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
          <textarea placeholder="Enter card title..." { ...addCardTextAreaRef.domProps } />
        </div>
        {cards}
      </div>
    </div>
  );
}