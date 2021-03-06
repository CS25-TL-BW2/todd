import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import Map from './map.js';

let headers = {
  headers: {
    "Authorization": "Token 
  //   "Content-Type": "application/json"
  }
}

function App() {
  const [ rooms, setRooms ] = useState([]);
  const [roomNum, setRoomNum ] = useState('')
  const [ showMap, setShowMap ] = useState(false);
  const [ exits, setExits ] = useState([]);
  const [ items, setItems ] = useState([]);
  const [ description, setDescription ] = useState('');
  const [ coordinates, setCoordinates ] = useState('');
  const [ cooldown, setCooldown ] = useState(0);
  const [ messages, setMessages ] = useState([]);
  const [ errors, setErrors ] = useState([]);
  const [ title , setTitle ] = useState('');
  const [ itemsCarrying, setItemsCarrying ] = useState([]);
  const [ players, setPlayers ] = useState([]);
  // room_id: 10
  // title: "A misty room"
  // description: "You are standing on grass and surrounded by a dense mist. You can barely make out the exits in any direction."
  // coordinates: "(60,61)"
  // elevation: 0
  // terrain: "NORMAL"
  // players: (5) ["User 20668", "User 20656", "User 20721", "User 20679", "User 20676"]
  // items: []
  // exits: (3) ["n", "s", "w"]
  // cooldown: 1
  // errors: []
  // messages: []
  useEffect(() => {
    axios.get('https://cs25-2ndbuild.herokuapp.com/rooms')
    .then(result => {
      let tempRooms = result.data.map(item => item.room_id)
      if (rooms.length === 0) {
        setRooms(tempRooms)
        console.log(tempRooms)
      }
    })
    .catch(err => {
      console.log(err)
    })
  })
  const addRoom = (room) => {
    let builtRoom = {
       room_id: room.room_id,
        title: room.title,
        description: room.description,
        coordinates: room.coordinates,
        elevation: room.elevation,
        terrain: room.terrain,
        n_exit: exits.includes("n") ? true : false,
        s_exit: exits.includes("s") ? true : false,
        e_exit: exits.includes("e") ? true : false,
        w_exit: exits.includes("w") ? true : false
    }
    console.log(builtRoom)
    axios.post('https://cs25-2ndbuild.herokuapp.com/rooms', builtRoom)
        .then(result => {
          console.log(result.data)
          setRooms([...rooms, room.room_id])
        })
        .catch(err => {
          console.log(err)
        })
  }
  const move = (direction) => {
    if (cooldown === 0 && exits.includes(direction)){
      axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/move/', { "direction": direction }, headers)
    .then(result => {
      console.log(result.data.coordinates)
      setRoomNum([result.data.room_id])
      setTitle(result.data.title)
      setDescription(result.data.description)
      setItems(result.data.items)
      setCoordinates(result.data.coordinates)
      setCooldown(result.data.cooldown + 1)
      setMessages(result.data.messages)
      setErrors(result.data.setErrors)
      setExits(result.data.exits)
      setTimeout(() => {
         if (rooms.includes(result.data.room_id) === false){
        addRoom(result.data)
      }
      }, 1000)
     
    })
    .catch(err => {
      console.log(err)
    })
  }
    }
    

  const info = () => {
    axios.get('https://lambda-treasure-hunt.herokuapp.com/api/adv/init/', headers )
    .then(result => {
      console.log(result.data)
      setExits(result.data.exits)
      setRoomNum([result.data.room_id])
      setTitle(result.data.title)
      setDescription(result.data.description)
      setItems(result.data.items)
      setCoordinates(result.data.coordinates)
      setCooldown(result.data.cooldown + 1)
      setMessages(result.data.messages)
      setErrors(result.data.setErrors)
    })
    .catch(err => {
      console.log(err)
    })
  }

  const pickUp = (treasure) => {
    axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/take/', { "name":"treasure" }, headers)
    .then(result => {
      setItemsCarrying([...itemsCarrying, treasure])
    })
    .catch(err => {
      console.log(err)
    })
  }
  const pray = () => {
    axios.post('https://lambda-treasure-hunt.herokuapp.com/api/adv/pray/', headers)
    .then(result => {
      console.log(result)
    })
    .catch(err => {
      console.log(err)
    })
  }
  if (cooldown > 0){
    setTimeout(() => {
      setCooldown(cooldown - 1)
    }, 1000)
  }
  return (
    <div className="App">
      <p>
        <button onClick={() => move("n")}>North</button>
      </p>
      <button onClick={() => move("e")} style={{marginRight: "40px"}}>East</button>
      <button onClick={() => move("w")}>West</button>
      <p>
      <button onClick={() => move("s")}>South</button>
      </p>

      <button onClick={() => info()}>Get room Location</button>
      
      <p>Exits</p>
      {exits.map((direction, index) => {
        return <p key={index}>{direction}</p>
      })}
      <h2>Room: {roomNum}</h2>
      <h3>{description}</h3>
      {items.length > 0 && <h5>Items</h5>}
      {items.length > 0 && items.map(item => {
        return <button style={{color: "red"}} onClick={() => pickUp(item)}>Pick up {item}</button>
      })}
      <p>CoolDown: { cooldown }</p>
      <p>Messages: {messages} </p>
      {/* <p>Pray: <button onClick={pray}>Pray Now</button></p> */}
      { showMap && <Map />}
    </div>
  );
}

export default App;