import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ICard, IList } from '../../../shared/data-types';
import { DepsContext } from '../App';
import { Icon } from '../Icon';
import './CardDetails.scss';

export function CardDetails(): JSX.Element {
  const [card, setCard] = useState<ICard | null>(null);
  const [list, setList] = useState<IList | null>(null);
  const { id } = useParams<{id: string}>();
  const { boardStore } = useContext(DepsContext);

  const loadCardDetailsFromStore = useCallback(() => {
    const cardDetails = boardStore.getCardAndList(id);
    if (cardDetails) {
      setCard(cardDetails.card);
      setList(cardDetails.list);
    }
  }, [boardStore, id]);

  useEffect(() => {
    loadCardDetailsFromStore();
  }, [loadCardDetailsFromStore]);

  boardStore.subscribeToLists(() => {
    loadCardDetailsFromStore();
  });

  if (card && list) {
    return (
      <div className="card-details-wrapper">
        <div className="card-details">
          <div className="section">
            <Icon name="gg-calendar-two" />
            <div>
              <div className="title">{card.title}</div>
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
                {card.history.map((action, i) => <div key={i}>action.description</div>)}
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