import React from "react";
import "./CardShort.css";

const CardShort = (props) => {
    const {image, name} = props.data;
    return (
      <div className="card">
        <img src={image} />
        <div className="title">{name}</div>
      </div>
    );
  }

export default CardShort;
