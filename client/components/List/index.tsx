import React, { useEffect } from 'react';
import { IList } from '../../../shared/data-types';
import './List.scss';

export default function List(props: IList): JSX.Element {
  return (
    <div className="list">
      <span className="title">{props.title}</span>
    </div>
  );
}