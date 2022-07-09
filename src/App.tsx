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


import React, { useEffect } from "react";
import "./styles.css";
import { Card, Button, Typography } from "@mui/material";
import Draggable from "react-draggable";
import { useState } from "react";

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

export default function App() {
  const [loadedDecks, setLoadedDecks] = useState<Deck[]>([]); // stores fetched decks
  const [currentDeckInds, setCurrentDeckInds] = useState<number[]>([]); // tracks currently selected decks
  const [currentCards, setCurrentCards] = useState<Card[]>([]); // cards that may be displayed
  const [displayCard, setDisplayCard] = useState<Card>({q:"",a:""} as Card);

  // make some buttons that load in current decks
  function load(ind:number) {
    for (let deck of loadedDecks) {
      if (deck.idx === ind) {
        return;
      }
    } // no matches => fetch the deck

  }


  return (
    <div className="App">
      <div onClick={() => {}}>
        <p>Button1</p>
      </div>
      {/*       
      <DraggableCard text="Drag" bgColor="#FF9300" />
      <DraggableCard text="Drop" bgColor="#00A2FF" /> 
      */}

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
