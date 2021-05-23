import React, { useEffect } from 'react';

export default function App(): JSX.Element {
  useEffect(() => {
    const fetchLists = async () => {
      const res = await fetch('http://localhost:3000/api/lists');
      const json = await res.json();
      console.log(json);
    };

    fetchLists();
  }, []);

  return <p>Initial Hellooy</p>;
} 