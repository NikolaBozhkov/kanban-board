import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ActionType, ICard, IList } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { useRefTextArea } from '../hooks/utility';
import { Icon } from '../Icon';
import './CardDetails.scss';

export function CardDetails(): JSX.Element {
  const [card, setCard] = useState<ICard | null>(null);
  const [list, setList] = useState<IList | null>(null);
  const { id } = useParams<{id: string}>();
  const { boardStore, cardService } = useContext(DepsContext);

  const titleRefInput = useRefTextArea(
    async function enterHandler() {
      if (!card) { return; }

      try {
        const updatedCard = await cardService.update(card.id, { title: titleRefInput.value });
        boardStore.updateCard(updatedCard);
      } catch (error) {
        console.log(error);
      }
    }
  );

  const loadCardDetailsFromStore = useCallback(() => {
    const cardId = boardStore.getLists()[0]?.cards[0]?.id ?? '';
    const cardDetails = boardStore.getCardAndList(cardId);
    if (cardDetails) {
      setCard(cardDetails.card);
      setList(cardDetails.list);
      titleRefInput.setValue(cardDetails.card.title);
    }
  }, [boardStore, id, titleRefInput]);

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
              <textarea className="title" { ...titleRefInput.domProps } />
              <div>in list&nbsp;<span className="list-title">{list.title}</span></div>
            </div>
          </div>
          <div className="section">
            <Icon name="gg-notes"/>
            <div>
              <h1>Description:</h1>
              <div>{card.description}</div>
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