import React, { useEffect, useState, useRef, Fragment } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { IList } from '../../../shared/data-types';
import List from '../List';
import Icon from '../Icon';
import './App.scss';

export default function App(): JSX.Element {
  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      addList();
    } else if (event.key == 'Escape') {
      setIsAddingList(false);
    }
  }

  async function addList() {
    const title = addListInput.current.value;
    if (title == "") {
      return;
    }

    const res = await fetch('http://localhost:3000/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    const json = await res.json();
    const errorJson = json as { error: string };
    const newList = json as IList;
    
    if (!res.ok && errorJson) {
      console.log('Error: ' + errorJson.error);
    } else if (res.ok && newList) {
      setLists([...lists, newList]);
      setIsAddingList(false);
      addListInput.current.value = "";
    }
  }

  async function removeList(listId: string) {
    const res = await fetch('http://localhost:3000/api/lists', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: listId })
    });

    if (res.ok) {
      setLists(lists.filter((list) => list.id != listId));
    } else {
      const errorJson = await res.json() as { error: string };
      console.log('Error: ' + errorJson.error);
    }
  }

  const [lists, setLists] = useState<IList[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const addListInput = useRef<HTMLInputElement>(null!);

  useEffect(() => {
    const fetchLists = async () => {
      const res = await fetch('http://localhost:3000/api/lists');
      const newLists = await res.json() as IList[];
      setLists(newLists);
    };

    fetchLists();
  }, []);

  useEffect(() => {
    if (isAddingList) {
      addListInput.current.focus();
    } else {
      addListInput.current.value = "";
    }
  }, [isAddingList]);

  const listComponents = lists.map((list) => <List list={list} key={list.id} onRemove={removeList} />);

  const addListClassNames = classnames({
    'add-list': true,
    'adding-list': isAddingList
  });

  return (
    <div className="lists">
      {listComponents}
      <div className={addListClassNames}>
        <div className="header">
          <input type="text" placeholder="Enter list title..." ref={addListInput} onKeyDown={handleKeyDown} />
          {isAddingList &&
            <Fragment>
              <Icon name="gg-check" onClick={addList} className="confirm-add-icon" />
              <span className="divider" />
            </Fragment>
          }
          <Icon name="gg-math-plus" onClick={() => setIsAddingList(!isAddingList)} className="add-toggle-icon" />
        </div>
        <div className="list-underline" />
      </div>
    </div>
  );
} 