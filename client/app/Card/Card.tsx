import React from 'react';
import { ICard } from '../../../shared/data-types';
import { Icon } from '../Icon';
import './Card.scss';

export function Card(card: ICard): JSX.Element {
  return (
    <div className="card">
      <span className="title">{card.title}</span>
      <div className="options">
        <Icon name="gg-more-vertical-alt" />
        <div className="options-highlight" />
      </div>
    </div>
  );
}