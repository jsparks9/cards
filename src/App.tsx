// import BoxSx from './components/Box.tsx'


// function App() {
//   return (
//     <>
//       <BoxSx/>
//       <div className="App">
        
//         <h1>Content!</h1>
//       </div>
//     </>
//   );
// }

// export default App;


import React, { useEffect, useState } from "react";
import "./styles.css";
import { Card, Button, Typography } from "@mui/material";
import Draggable from "react-draggable";
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

interface Card {
  q: string;
  a: string;
}

interface Deck {
  idx: number; // each deck has an index, i.e. SQL is 1, Java is 2, etc
  cards: Card[]
  memory: number[]; // keeps track of recent cards
  memlen: number; // maximum memory length for deck
}

const api_base = 'https://raw.githubusercontent.com/jsparks9/cards/main/API/';
const decks = ['SQL','Java','HTMLCSS','JavaScript1','TypeScript','React'];
const ex = '.json';
let hasSent = false;

export default function App() {
  const [loadedDecks, setLoadedDecks] = useState<Deck[]>([]); // stores fetched decks
  const [loadedDeckInds, setLoadedDeckInds] = useState<number[]>([]); // tracks fetched decks by index
  const [currentDeckInds, setCurrentDeckInds] = useState<number[]>([]); // tracks currently selected decks
  const [currentCards, setCurrentCards] = useState<Card[]>([]); // cards that may be displayed
  const [displayCard, setDisplayCard] = useState<Card>({q:"",a:""} as Card);

  const [deckSelection, setDeckSelection] = React.useState([decks[0]]);

  const handleDeckSelection = (
    event: React.MouseEvent<HTMLElement>,
    currentSel: string[],
  ) => {
    if (currentSel.length) { // enforces at least one selection
      setDeckSelection(currentSel);
    }
  };

  useEffect(() => {
    console.log("deckSelection changed. current selection is " + deckSelection);
    
    if (loadedDeckInds.length < decks.length) { // check if all decks have been fetched
      console.log("Running inner code");
      let inds:number[] = [];
      for (let entry in deckSelection) {
        // console.log("entry:"+deckSelection[entry])
        let ind = decks.indexOf(deckSelection[entry]);
        if (ind >= 0) {
          inds.push(ind);
        }
      };
      inds.sort();
      console.log(inds); // working up to here
      let add:number[] = [];
      (inds.filter(item => loadedDeckInds.indexOf(item) < 0)).forEach(dif => add.push(dif) && load(dif));
      setLoadedDeckInds([...loadedDeckInds, ...add].sort()) // keep track of fetched decks
    }
  }, [deckSelection])

  useEffect(() => {
    console.log("loadedDeckInds updated to "+ loadedDeckInds)
  }, [loadedDeckInds])


  async function load(ind:number) {
    // for (let deck of loadedDecks) {
    //   if (deck.idx === ind) {
    //     return;
    //   }
    // } // no matches => fetch the deck
    console.log("getting the deck by ID "+ind);
    let resp = await fetch(api_base+decks[ind]+ex);
    if (Math.floor(resp.status/100) === 2) { // 200 expected
      let data = await resp.json();
      console.log("Got data, calling injectDeck");
      injectDeck(ind, await data);
    }
  }

  function injectDeck(ind:number, data:any) {
    let deck:Deck = {idx:ind,cards:data as unknown as Card[], memory:[], memlen:0} as Deck;
    deck.memlen = Math.floor(deck.cards.length / 2);
    console.log("setting loaded decks with response");
    setLoadedDecks([...loadedDecks, deck]);
  }

  // useEffect(() => {
  //   console.log(loadedDecks);
  //   console.log("length: " + loadedDecks.length)
  // }, [loadedDecks])

  useEffect(() => { 
    if(!hasSent ) { // !loadedDecks prevents additional fetches during development
      hasSent = true; // prevents double request
      console.log("Page loaded. Calling load(0)");
      load(0); 
      // setDeckSelection([decks[0]]);
      //hasSent = false; // not sure about this
    }
  }, []) // loads first deck

  



  return (
    <div className="App">
      <div className="Please_delete_me" onClick={() => {}}>
        <p>Button16</p>
        <div><button onClick={() => {console.log("loadedDeckInds.length="+loadedDeckInds.length)}}>loadedDeckInds.length</button></div>
        <button onClick={() => {console.log("loadedDecks.length="+loadedDecks.length)}}>loadedDecks.length</button>
      </div>

      <ToggleButtonGroup
        orientation="vertical"
        value={deckSelection}
        onChange={handleDeckSelection}
        // aria-label="device"
      >
        {decks.map((n) =>
        <ToggleButton key={n} value={n} aria-label={n}>
          {n}
        </ToggleButton>
        )}
      </ToggleButtonGroup>
    </div>
  );
}



/**
 * Material-UI Card that you can drag and drop anywhere.
 */
const DraggableCard = ({ text, bgColor }) => {
  return (
    <Draggable >
      <Card 
      onClick={()=>{console.log("thing clicked")}} 
      onMouseDownCapture={()=>{console.log("onMouseDownCapture")}}
      onMouseMoveCapture={()=>{console.log("Moved"+ new Date().getTime())}}
        style={{ width: "40%", backgroundColor: bgColor, color: "#ffffff" }}
      >
        <Button variant="text">BUY</Button>
        <Typography variant="h6">{text}</Typography>
      </Card>
    </Draggable>
  );
};

/**
 * Material-UI Button in a Card. You can drag and drop the button
 * anywhere within the card.
 */
const DraggableButtonInCard = ({ text, bgColor }) => {
  return (
    <Card style={{ width: "40%", backgroundColor: bgColor, color: "#ffffff" }}
    >
      {/* <Draggable></Draggable> */}
      <Button variant="text">BUY</Button>
      <Typography variant="h6">{text}</Typography>
    </Card>
  );
};
