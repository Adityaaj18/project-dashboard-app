import React from "react";
import "./CardDetails.css";

const CardDetails = (props) => {
    const {image, name, cuisine, rating } = props.data;

    return (
      <div className="card-details">
        <img src={image} alt={name} />
        <div className="price">Items at 2900 Rs.</div>
        <div className="item-title">{name}</div>
        <div>Coisine: {cuisine}</div>
        <div>Ratings: {rating}</div>
      </div>
    );
  }

export default CardDetails;
 
  