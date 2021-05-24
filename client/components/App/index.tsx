import React, { useEffect, useState } from 'react';
import { IList } from '../../../shared/data-types';
import List from '../List';
import './App.scss';

export default function App(): JSX.Element {
  const [lists, setLists] = useState<IList[]>([]);

  useEffect(() => {
    const fetchLists = async () => {
      const res = await fetch('http://localhost:3000/api/lists');
      const newLists = await res.json() as IList[];
      setLists(newLists);
    };

    fetchLists();
  }, []);

  const listComponents = lists.map((list) => <List {...list} key={list.id} />);

  return (
    <div className="lists">
      {listComponents}
      <div className="add-list">
        <span className="icon"><i className="gg-math-plus" /></span>
        <div className="list-underline" />
      </div>
    </div>
  );
} 