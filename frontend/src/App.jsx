import AppRoutes from "./routes/AppRoutes";
import { ConfigProvider } from "antd";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Ant Design theme configuration
const antdTheme = {
  token: {
    colorPrimary: "#1890ff",
  },
};

// MUI theme configuration
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#1890ff",
    },
  },
});

function App() {
  return (
    <ConfigProvider theme={antdTheme}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
