import React, { useEffect, useState, useRef, useContext, Fragment } from 'react';
import classnames from 'classnames';

import { DepsContext } from '../App';
import { List } from '../List';
import { Icon } from '../Icon';
import { useRefInput } from '../hooks/input-hooks';
import './Board.scss';
import { IPopulatedList } from '../../../shared/data-types';

export function Board(): JSX.Element {
  const { listService, boardStore } = useContext(DepsContext);
  const [lists, setLists] = useState<IPopulatedList[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const addListInput = useRef<HTMLInputElement | null>(null);
  const [listComponents, setListComponents] = useState<JSX.Element[]>([]);

  const filterInput = useRefInput();

  useEffect(() => {
    const unsubscribeLists = boardStore.subscribeToPopulatedLists(lists => {
      setLists(lists);
    });

    return () => unsubscribeLists();
  }, [boardStore, filterInput.value]);

  useEffect(() => {
    setListComponents(lists.map((list) => <List list={list} listsCount={lists.length} filter={filterInput.value} key={list.id} />));
  }, [lists, filterInput.value]);

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key == 'Enter') {
      addList();
    } else if (event.key == 'Escape') {
      setIsAddingList(false);
    }
  }

  async function addList() {
    if (addListInput.current == null) { return; }

    const title = addListInput.current.value;
    if (title == '') {
      return;
    }

    try {
      const newList = await listService.add(title);
      console.log(newList);
      boardStore.addList(newList);
      setIsAddingList(false);
      addListInput.current.value = '';
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const lists = await listService.getAllPopulated();
        boardStore.setLists(lists);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLists();
  }, [listService, boardStore]);

  useEffect(() => {
    if (addListInput.current == null) { return; }
    if (isAddingList) {
      addListInput.current.focus();
    } else {
      addListInput.current.value = '';
    }
  }, [isAddingList]);

  const addListClassNames = classnames({
    'add-list': true,
    'adding-list': isAddingList
  });

  return (
    <div className="board-container">
      <div className="filter-container">
        <input type="text" {...filterInput.domProps} placeholder="Filter by title..." />
      </div>
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
    </div>
  );
} 