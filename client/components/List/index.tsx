import React, { useEffect } from 'react';
import { IList } from '../../../shared/data-types';
import './List.scss';

export default function List(props: IList): JSX.Element {
  return (
    <div className="list">
      <div className="header">
        <div className="info-wrapper">
          <span className="title">{props.title}{props.title}{props.title}{props.title}</span>
          <span className="options-btn"><i className="gg-more-alt" /></span>
        </div>
        <div className="list-underline" />
      </div>
    </div>
  );
}