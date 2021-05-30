import classnames from 'classnames';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionType, ICard, IList } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { useRefTextArea } from '../hooks/input-utils';
import { Icon } from '../Icon';
import './CardDetails.scss';

export function CardDetails(): JSX.Element {
  const [card, setCard] = useState<ICard | null>(null);
  const [list, setList] = useState<IList | null>(null);
  const { id } = useParams<{ id: string }>();
  const { boardStore, cardService } = useContext(DepsContext);

  const cardTitle = useRefTextArea(cardTitleEnterHandler);
  async function cardTitleEnterHandler() {
    const title = cardTitle.value.trim();
    if (!card || title == card.title) { return; }

    try {
      const updatedCard = await cardService.update(card.id, { title });
      boardStore.updateCard(updatedCard);
    } catch (error) {
      cardTitle.setValue(card.title);
      console.log(error);
    }
  }

  // This allows for blur to be used as confirmation
  // It has to give enough time for cancel button click to be able to trigger
  let shouldUpdateDescription = false;
  const cardDescription = useRefTextArea(function enterHandler() {
    shouldUpdateDescription = true;
    setTimeout(updateDescription, 300);
  }, function escapeHandler() {
    setIsEditingDescription(false);
  }, true);

  const [isEditingDescription, setIsEditingDescription] = useState(false);

  function handleCardDescriptionFocus(event: React.FocusEvent) {
    cardDescription.domProps.onFocus(event);
    setIsEditingDescription(true);
  }
  
  async function updateDescription() {
    setIsEditingDescription(false);
    if (!card || !shouldUpdateDescription) { return; }

    try {
      const description = cardDescription.value.trim();
      const updatedCard = await cardService.update(card.id, { description });
      boardStore.updateCard(updatedCard);
    } catch (error) {
      cardDescription.setValue(card.description);
      console.log(error);
    }

    shouldUpdateDescription = false;
  }

  async function handleConfirmDescriptionEdit() {
    console.log('confirm');
    updateDescription();
  }

  function handleCancelDescriptionEdit() {
    console.log('cancel');
    cardDescription.setValue(card?.description ?? '');
    shouldUpdateDescription = false;
    setIsEditingDescription(false);
  }

  const loadCardDetailsFromStore = useCallback(() => {
    const cardId = boardStore.getLists()[0]?.cards[0]?.id ?? '';
    const cardDetails = boardStore.getCardAndList(cardId);
    if (cardDetails) {
      setCard(cardDetails.card);
      setList(cardDetails.list);
      cardTitle.setValue(cardDetails.card.title);
      cardDescription.setValue(cardDetails.card.description);
    }
  }, [boardStore, id, cardTitle, cardDescription]);

  // Fetch the card details from store on mount
  useEffect(() => {
    loadCardDetailsFromStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  boardStore.subscribeToLists(() => {
    loadCardDetailsFromStore();
  });

  if (card && list) {
    return (
      <div className="card-details-wrapper">
        <div className="card-details">
          <div className="highlight" />
          <div className="section">
            <Icon name="gg-calendar-two" />
            <div>
              <textarea className="title" { ...cardTitle.domProps } />
              <div>in list&nbsp;<span className="list-title">{list.title}</span></div>
            </div>
          </div>
          <div className="section">
            <Icon name="gg-notes"/>
            <div>
              <h1>Description:</h1>
              <div>
                <textarea { ...cardDescription.domProps } onFocus={handleCardDescriptionFocus} />
                {isEditingDescription &&
                  <div>
                    <span onClick={handleConfirmDescriptionEdit}>OK</span>&nbsp;
                    <span onClick={handleCancelDescriptionEdit}>Cancel</span>
                  </div>
                }
              </div>
            </div>
          </div>
          <div className="section">
            <Icon name="gg-time" />
            <div>
              <h1>Activity:</h1>
              <div>
                {card.history.map((action, i) => {
                  let iconName = '';
                  if (action.type == ActionType.Add) {
                    iconName = 'gg-math-plus';
                  } else if (action.type == ActionType.Edit) {
                    iconName = 'gg-pen';
                  } else if (action.type == ActionType.Move) {
                    iconName = 'gg-move-right';
                  }

                  return (
                    <div key={i} className="action">
                      <Icon name={iconName} />
                      <span>{action.description}</span>
                    </div>
                  ); 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Loading or error msg
    return <div>Card not loaded</div>;
  }
}