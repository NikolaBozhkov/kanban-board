import React, { useEffect, useState, useRef, useContext, Fragment } from 'react';
import classnames from 'classnames';

import { DepsContext } from '../App';
import { List } from '../List';
import { Icon } from '../Icon';

export function Board(): JSX.Element {
  const { listService, boardStore } = useContext(DepsContext);

  const [isAddingList, setIsAddingList] = useState(false);
  const addListInput = useRef<HTMLInputElement | null>(null);
  const [listComponents, setListComponents] = useState<JSX.Element[]>([]);

  useEffect(() => {
    async function removeList(listId: string) {
      try {
        await listService.delete(listId);
        boardStore.removeList(listId);
      } catch (error) {
        console.log(error);
      }
    }

    boardStore.subscribeToLists(lists => {
      setListComponents(lists.map((list) => <List list={list} key={list.id} onRemove={removeList} />));
    });
  }, [boardStore, listService]);

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