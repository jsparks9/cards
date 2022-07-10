import React, { SyntheticEvent, useEffect, useState } from "react";
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
let decks = ['SQL','Java','HTMLCSS','JavaScript1','TypeScript','React'];
const ex = '.json';
let hasSent = false;
let qm_down = false;
let qm_moved = false;
let show_a = true;
const default_a = "<h3>Click to Show Answer";

export default function App() {
  const [loadedDecks, setLoadedDecks] = useState<Deck[]>([]); // stores fetched decks
  const [loadedDeckInds, setLoadedDeckInds] = useState<number[]>([]); // tracks fetched decks by index
  const [currentDeckInds, setCurrentDeckInds] = useState<number[]>([]); // tracks currently selected decks
  const [currentCards, setCurrentCards] = useState<Card[]>([]); // cards that may be displayed
  const [orderInd, setOrderInd] = useState<number[]>([]); // tracks deck order in currentCards
  const [displayCard, setDisplayCard] = useState<Card>({q:"<h1>Click to display a question</h1>",a:""} as Card);

  const [showA, setShowA] = useState(true);
  const [deckSelection, setDeckSelection] = React.useState<string[]>([]);

  const handleDeckSelection = (
    event: React.MouseEvent<HTMLElement>,
    currentSel: string[],
  ) => {
    if (currentSel.length) { // enforces at least one selection
      console.log("Setting deck selection to "+currentSel)
      setDeckSelection(currentSel);
    }
  };

  useEffect(() => {
    console.log("deckSelection changed. current selection is " + deckSelection);
    let inds:number[] = [];
    for (let entry of deckSelection) {
      console.log("entry:"+entry);
      let ind = decks.indexOf(entry); // in : deckSelection[entry]
      if (ind >= 0) {
        inds.push(ind);
      }
    };
    inds.sort();
    console.log(inds); 
    setCurrentDeckInds(inds);
    if (loadedDeckInds.length < decks.length) { // check if all decks have been fetched
      let add:number[] = [];
      (inds.filter(item => loadedDeckInds.indexOf(item) < 0)).forEach(dif => add.push(dif) && load(dif));
      setLoadedDeckInds([...loadedDeckInds, ...add].sort()) // keep track of fetched decks
    }
  }, [deckSelection])

  useEffect(() => {
    console.log("loadedDeckInds updated to "+ loadedDeckInds)
  }, [loadedDeckInds])

  useEffect(() => {
    // set setCurrentCards to be from the selected decks
    let order:number[] = [];
    let cardColl:Card[] = [];
    // while(currentDeckInds.length != loadedDecks.length) {
    //   console.log("Not equal");
    // }
    console.log("debug: "+currentDeckInds.length + " " + loadedDecks.length);
    for (let i of currentDeckInds) { // for each currentDeckInd selected by user, 
      for (let d of loadedDecks) {
        if (d.idx === i) {
          order.push(i);
          console.log("adding "+ d.cards.length +" cards");
          cardColl = cardColl.concat(d.cards);
          break; // terminate inner loop
        }
      }
    }
    console.log(cardColl); // empty
    console.log("Current Cards should be set");
    setCurrentCards(cardColl);
    setOrderInd(order);
    // now ready for flashcard functionality
  },[loadedDecks, currentDeckInds]) // working solution; perhaps not the best solution


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
    } else {
      console.log("fetch failed with code "+resp.status); 
      // Hardcode decks as backup
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

  // useEffect(() => { 
  //   if(!hasSent ) { // !loadedDecks prevents additional fetches during development
  //     hasSent = true; // prevents double request
  //     console.log("Page loaded. Calling load(0)");
  //     load(0); 
  //     setLoadedDeckInds([0]);
  //     setCurrentDeckInds([0]);
  //     // setDeckSelection([decks[0]]);
  //     //hasSent = false; // not sure about this
  //   }
  // }, []); // loads first deck

  const getNextCard = () => {
    console.log("getting next card");
    console.log("currentCards.length=" + currentCards.length);
    let mem:number[] = [];
    let mem_offset = 0;
    let cards:Card[] = [];
    let deck_len:number[] = [];
    // cards are always in order 
    let deck_ind:number[] = currentDeckInds.sort();
    for (let i of deck_ind) {
      for (let d of loadedDecks) {
        if (d.idx === i) {
          cards = cards.concat(d.cards); // add cards
          console.log("mem before: " + mem);
          console.log("Deck " + decks[d.idx] + " has " + d.cards.length + " cards and mem " + d.memory);
          mem = mem.concat(d.memory.map(m => (m+mem_offset)));
          console.log("Adding memory: " + d.memory+" with offset "+mem_offset);
          console.log("mem after: " + mem);
          mem_offset += d.cards.length;
          deck_len = deck_len.concat([mem_offset]);
          console.log("mem_offset= "+ mem_offset);
          break; // break inner loop
        }
      }
    }
    console.log("current mem: " + mem);
    console.log("deck_ind: "+deck_ind);

    const max:number = cards.length - mem.length;
    let rnum:number = Math.floor(Math.random() * max);
    let i = 0;
    while(i <= rnum) {
      if (mem.includes(i)) {rnum++}
      i++;
    }
    // trace what card was selected, then manage relevent deck's memory
    let last_deck_len = 0;
    for (let i in deck_len) {
      // console.log("i is: "+ i);
      // console.log("Deck len "+deck_len[i]);
      if (rnum < deck_len[i]) {
        // console.log("card is from "+decks[deck_ind[i]])
        for (let d of loadedDecks) {
          if (d.idx === deck_ind[i]) {
            // console.log("Adding to mem of deck with first card: " + d.cards[0].q)
            console.log("pushing "+(rnum-last_deck_len)+" to mem of Deck " + decks[d.idx] + " that has "+d.cards.length+" cards");
            d.memory.push(rnum-last_deck_len);
            if (d.memory.length > d.memlen) {d.memory.shift()}
            // console.log("mem now: "+ d.memory);
            break;
            
          }
        }
        break;
      }
      last_deck_len = deck_len[i];
    }

    if (currentCards && currentCards[rnum]) {
      setDisplayCard(currentCards[rnum]);
    }
    else {
      setDisplayCard({q:"<h1>No Cards Loaded</h1>", a:"<h1></h1>"} as Card);
    }
    console.log(currentCards);

  }

  const q_m_down = (e:SyntheticEvent) => {
    console.log("currentCards.length= "+currentCards.length)
    console.log("click down");
    qm_down = true;
  }
  const q_m_move = (e:SyntheticEvent) => {
    console.log("moved");
    if (qm_down) { qm_moved = true;
    }
  }
  const q_m_up = (e:SyntheticEvent) => {
    console.log("click up");
    if (!qm_moved) {
      qm_down = false; 
      qm_moved = false;
      show_a = false;
      setShowA(false);
      getNextCard();}
    if (qm_moved) {
      qm_down = false; 
      qm_moved = false;
    }
  }

  const a_m_down = (e:SyntheticEvent) => {
    console.log("click down");
    qm_down = true;
  }
  const a_m_move = (e:SyntheticEvent) => {
    console.log("moved");
    if (qm_down) { qm_moved = true;
    }
  }
  const a_m_up = (e:SyntheticEvent) => {
    console.log("click up");
    if (!qm_moved) {
      qm_down = false; 
      qm_moved = false;
      show_a = true;
      setShowA(true);
      
    }
    if (qm_moved) {
      qm_down = false; 
      qm_moved = false;
    }
  }
  



  return (
    <div className="App">
      {/* <div className="Please_delete_me" onClick={() => {}}>
        <p>Button16</p>
        <div><button onClick={() => {console.log("loadedDeckInds.length="+loadedDeckInds.length)}}>loadedDeckInds.length</button></div>
        <button onClick={() => {console.log("loadedDecks.length="+loadedDecks.length)}}>loadedDecks.length</button>
      </div> */}
    <Draggable >
      <Card 
        style={{ width: "500px", height: "300px", 
        backgroundColor: "#FF9300", color: "#ffffff" }}
      >
        <div //onClick={q_click} 
        onMouseDown={q_m_down}
        onMouseUp={q_m_up}
        onMouseMove={q_m_move}
        // resolve intent with non-state variables. 
        
        style={{ width: "100%", height: "100%"}}
        dangerouslySetInnerHTML={{__html: displayCard.q}}
        ></div></Card>
    </Draggable>

    <Draggable >
      <Card 
        style={{ width: "500px", height: "300px", 
        backgroundColor: "#00A2FF", color: "#ffffff" }}
      >
        <div 
          onMouseDown={a_m_down}
          onMouseUp={a_m_up}
          onMouseMove={a_m_move}
          style={{ width: "100%", height: "100%"}}
          dangerouslySetInnerHTML={{__html: (showA)?displayCard.a:default_a}}
        ></div></Card>
    </Draggable>

    <Draggable >
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
    </Draggable>
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
        style={{ width: "500px", height: "300px", backgroundColor: bgColor, color: "#ffffff" }}
      >
        <Button style={{ width: "100%", height: "100%"}}
        variant="text">BUY</Button>
        {/* <Typography variant="h6">{text}</Typography> */}
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
