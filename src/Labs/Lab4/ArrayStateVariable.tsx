import { useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
export default function ArrayStateVariable() {
 const [array, setArray] = useState([1, 2, 3, 4, 5]);
 const addElement = () => {
   setArray([...array, Math.floor(Math.random() * 100)]);
 };
 const deleteElement = (index: number) => {
   setArray(array.filter((_item, i) => i !== index));
 };
 return (
  <div id="wd-array-state-variables">
   <h2>Array State Variable</h2>
   <Button onClick={addElement} className="btn-success m-1">Add Element</Button>
   <ListGroup className="m-1">
    {array.map((item, index) => (
     <ListGroup.Item key={index}> <h2 className="float-start">{item}</h2>
      <Button className="btn-danger float-end fs-5" onClick={() => deleteElement(index)}>
       Delete</Button>
     </ListGroup.Item>))}
   </ListGroup><hr/></div>);}