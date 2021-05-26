import React from 'react';
import { ICard } from '../../../shared/data-types';
import './Card.scss';

export function Card(card: ICard): JSX.Element {
  return (
    <div className="card">
      <span className="title">{card.title}</span>
    </div>
  );
}