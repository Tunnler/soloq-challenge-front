import "./App.css";
import SummonerStats from "./components/SummonerStats";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

function App() {


  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
    typography: {
      fontFamily: [
        'Poppins'
      ].join(','),
    }
  });


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <h1>Ranking SoloQ</h1>
      <SummonerStats />
    </ThemeProvider>
  );

}
export default App;
