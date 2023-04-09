import React from "react";
import { Link } from "react-router-dom";

function ResultPage(props) {
  console.log(props.variable);

  return (
    <div>
      <h2>Thank you for signing up!</h2>
      <p>{props.variable}</p>
      <Link to="/">Вернуться на предыдущую страницу</Link>
    </div>
  );
}

export default ResultPage;
