import React from "react";
import { Link } from "react-router-dom";

function ResultPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const variable = JSON.parse(searchParams.get("variable"));
  // console.log(variable);

  return (
    <div>
      <h2>{variable}</h2>
      <Link to="/">Вернуться на предыдущую страницу</Link>
    </div>
  );
}

export default ResultPage;
