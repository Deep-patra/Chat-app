import React, { useMemo, useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Outlet  } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, Typography } from '@mui/material';
import Header from './components/Header/header';
import Nav from './components/Drawer/drawer';
import Login from './components/Login/login';
import Signup from './components/Signup/signup';
import Profile from './components/Profile/profile';
import Search from './components/Search/search';
import Friends from './components/Friends/friends';
import Groups from './components/Groups/group';
import Logout from './components/Logout/logout';
import StartWorker from './components/Socket/socket';
import {
  setUser
} from './store/actionMethods';
import './App.css';


const themeColor = "#2d98da";
const getDesignTokens = (mode) => {
  return {
    palette: {
      mode,
      border: {
        main: themeColor,
      },
      primaryColor: {
        main: themeColor,
      },
      error: {
        main: '#c0392b',
      },
      success: {
        main: '#2ecc71',
      },
      ...(mode === 'light') ?
      {
        primary: {
          main: '#fff',
        },
        secondary: {
          main: '#D6A2E8'
        },
        opposite: {
          main: '#7f8c8d'
        },
      } : {
        primary: {
          main: '#000',
        },
        secondary: {
          main: '#3B3B98',
        },
        opposite: {
          main: '#FFF',
        },
      },
    },
    typography: {
      poster: {
        color: (mode === 'light' ? '#7f8c8d' : '#fff'),
      },
    },
    components: {
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: themeColor,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: themeColor,
          },
          arrow: {
            color: themeColor,
          }
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            color: ( mode === 'light' ? 'rgba(0,0,0,1)' : '#fff'),
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: (mode === "dark" ? themeColor : "#bdc3c7"),
            border: `1px solid ${themeColor}`,
            '& .MuiSvgIcon-root': {
              color: (mode === "dark" ? "#FFF" : themeColor),
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: themeColor,
          },
        },
      },
    },
  };
};


const DashBoard = ({ open, toggle }) => {
  const userId = useSelector(state => state.userId);

  // register the user through the web socket
  StartWorker.handleRegister(userId);
  return (
    <Box
      display={{ sm: "grid", xs: "flex" }}
      gridRow="line2/line3"
      gridTemplateColumns="repeat(12, 1fr)"
      flexDirection="column"
      gridTemplateRows="1fr"
      overflow="none"
      mt={{ xs: "0px", sm: "10px" }}
    >
      <Nav open={open} toggleMenu={toggle} />
      <Outlet/>
    </Box>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetch('/home', {
      method: 'GET',
      accept: 'application/json',
    })
    .then(response => {
      if (!response.ok && response.status !== 200) throw new Error('response is not ok');
      return response;
    })
    .then(response => response.json())
    .then(res => {

      // dispatch the user details to the store
      dispatch(setUser(res));

      // navigate the page to dashboard
      navigate('/dashboard');
    })
    .catch(err => {
      console.log(err);
      navigate('/signup');
    });
  }, []);
  return (
    <>
      <Outlet />
    </>
  );
};


const Navigate = ({ url }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(url);
  }, []);
  return (
    <>
      <Outlet/>
    </>
  );
}

const getTheme = (state) => state.theme; 
const App = () => {
  const [open, toggleMenu] = useState(false);
  const [loading, toggleLoading] = useState(false);

  const mode = useSelector(getTheme);

  const theme = useMemo(() => 
    createTheme(getDesignTokens(mode))
  , [mode]);

  const changeLoadingStatus = () => {
    toggleLoading(false);
  }

  const toggle = () => toggleMenu(!open);
  
  
  useEffect(() => {

    // setup the websocket connection
    async function setup () {
      await StartWorker.setupConnection(changeLoadingStatus);
    }
    setup();

  }, []);

  

  return (
      <ThemeProvider theme={theme}>
        { !loading ? (
          <Box 
          sx={{ maxHeight: "100vh", bgcolor:"primary.main" }}
          display="grid"
          gridTemplateRows={{
            xs: "[line1] 60px [line2] calc(100vh - 60px) [line3]",
            sm : "[line1] 60px [line2] calc(100vh - 60px) [line3]"
          }}
          gridTemplateColumns="1fr"
          gridRowGap={{xs: "10px", sm: "10px"}}
          overflow="none"
        >
          <Box>
            <Header toggle={toggle} />
          </Box>
          <Routes>
            <Route path="/" element={ <Home /> } />
            <Route path="/login" element={ <Login/> } />
            <Route path="/signup" element={ <Signup/> } />
            <Route path="/dashboard" element={<DashBoard open={open} toggle={toggle} />}>
              <Route path="/dashboard/profile" element={ <Profile /> } />
              <Route path="/dashboard/friends" element={ <Friends /> } />
              <Route path="/dashboard/groups" element={ <Groups /> } />
              <Route path="/dashboard/search" element={ <Search /> } /> 
              <Route path="/dashboard/logout" element={<Logout />} /> 
            </Route>
          </Routes>
        </Box>
        ) : (
          <Box 
            display="flex"
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <Box
              display="flex"
              flexDirection="column"
              flexWrap="nowrap"
              alignItems="center"
            >
              <CircularProgress color="primaryColor" />
              <Typography variant="poster" fontSize="15px">Waiting...</Typography>
            </Box>
          </Box>
        )}
      </ThemeProvider>
  );
}

export default App;
