
import React from "react";
import { Link } from 'react-router-dom';

function ResultPage(props) {
    return (
      <div>
        <h2>Thank you for signing up!</h2>
        <p>Your email has been added to our mailing list.</p>
        <Link to="/">Back to sign up</Link>
      </div>
    );
  }

  export default ResultPage;