import React, { useEffect, useState, useRef, useMemo, Fragment } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';

import { IList } from '../../../shared/data-types';
import { HttpClient } from '../../http/HttpClient';
import { ListService } from '../List/ListService';
import { List } from '../List';
import Icon from '../Icon';

import './App.scss';

export default function App(): JSX.Element {
  const httpClient = useMemo(() => new HttpClient(), []);
  const listService = useMemo(() => new ListService(httpClient), [httpClient]);

  const [lists, setLists] = useState<IList[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const addListInput = useRef<HTMLInputElement>(null!);

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

    try {
      const newList = await listService.add(title);
      setLists([...lists, newList]);
      setIsAddingList(false);
      addListInput.current.value = "";
    } catch (error) {
      console.log(error);
    }
  }

  async function removeList(listId: string) {
    try {
      await listService.delete(listId);
      setLists(lists.filter((list) => list.id != listId));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await listService.getAll();
        setLists(lists);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLists();
  }, [listService]);

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