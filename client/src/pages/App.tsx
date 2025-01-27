import { useEffect } from "react";

function Home() {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    fetch(`${apiUrl}/websites/school`)
      .then((response) => response.json())
      .then((data) => console.log(data));
  }, [apiUrl]);

  return (
    <>
      <h1>admin.mertalukas.cz</h1>
    </>
  )
}

export default Home
