import React from "react";
import "../styles/SignUpResultForm.css";
import { Link } from "react-router-dom";

function SignResultForm() {
  const searchParams = new URLSearchParams(window.location.search);
  const variable = JSON.parse(searchParams.get("variable"));
  // console.log(variable);

  const handleDownloadClick = () => {
    fetch("http://localhost:4000/api/verification/download")
      .then((res) => {
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "test.txt");
        document.body.appendChild(link);
        link.click();
      });
  };

  return (
    <div>
      <h2>{variable}</h2>
      {/* <Link onClick={handleDownloadClick}>Загрузить сертификат</Link> */}
      {/* <br/> */}
      <Link to="/">Вернуться на предыдущую страницу</Link>
    </div>
  );
}

export default SignResultForm;
